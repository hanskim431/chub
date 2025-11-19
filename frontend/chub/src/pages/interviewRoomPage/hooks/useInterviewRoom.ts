import { useState, useEffect, useRef, useCallback } from "react";
import { useMe } from "@/features/auth/api/me";
import { useInterviewRoomWebSocket } from "./useInterviewRoomWebSocket";
import {
  joinInterviewRoom,
  leaveInterviewRoom,
  createQuestion,
  submitAnswer,
} from "@/pages/interviewRoomPage/api/requests";

interface ChatMessage {
  id: string;
  senderId: number | null;
  senderName: string | null;
  receiverId: number | null;
  receiverNickname: string | null;
  content: string;
  timestamp: string;
  type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
}

// WebSocketMessage 래퍼 구조
interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

// InterviewRoomChatMessage (서버에서 받는 메시지)
interface InterviewRoomChatMessage {
  type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
  senderId: number | null;
  senderNickname: string | null;
  receiverId: number | null;
  receiverNickname: string | null;
  message: string;
  createdAt: string;
}

interface OpponentInfo {
  id: number;
  name: string;
  avatar: string;
  company?: string;
  position?: string;
  field?: string;
  interviewStyle?: string;
}

type InterviewStatus = "WAITING" | "QUESTION" | "ANSWER" | "COMPLETED" | string;

export function useInterviewRoom(roomId: string) {
  const { data: userData } = useMe();
  const userId = userData?.data?.id;

  // 공통 WebSocket은 useInterviewRoomWebSocket 내부에서 사용됨

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);
  const opponentInfoRef = useRef<OpponentInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interviewStatus, setInterviewStatus] =
    useState<InterviewStatus>("WAITING");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tailQuestions, setTailQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLocalAudioEnabled, setIsLocalAudioEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [userRole, setUserRole] = useState<
    "INTERVIEWER" | "INTERVIEWEE" | null
  >(null);
  const [interviewRoomId, setInterviewRoomId] = useState<number | null>(null); // API 응답에서 받은 id

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const offerSentRef = useRef<boolean>(false); // offer 전송 여부 추적
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const sendOfferWhenReadyRef = useRef<(() => Promise<void>) | null>(null);
  const interviewRoomIdRef = useRef<number | null>(null); // ref로도 저장하여 WebSocket 연결 시 사용
  const hasLeftRoomRef = useRef<boolean>(false); // 방 나가기 API 호출 여부 추적
  const publishRef = useRef<
    ((destination: string, body: string) => boolean) | null
  >(null); // WebSocket publish 함수 ref

  // WebRTC 설정 - Promise로 반환하여 로컬 스트림 로드 완료 보장
  const setupWebRTC = useCallback(async (): Promise<void> => {
    try {
      // 로컬 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      // 비디오 트랙이 실제로 로드될 때까지 대기
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        // 이미 로드된 경우
        await new Promise<void>((resolve) => {
          // 약간의 지연을 주어 비디오가 렌더링될 시간을 확보
          setTimeout(resolve, 100);
        });
      } else {
        // 비디오 트랙이 로드될 때까지 대기
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("비디오 로드 타임아웃"));
          }, 5000);

          const checkReady = () => {
            if (videoTrack && videoTrack.readyState === "live") {
              clearTimeout(timeout);
              setTimeout(resolve, 100); // 렌더링 시간 확보
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      // RTCPeerConnection 생성 (STUN/TURN 서버 환경 변수에서 읽기)
      const stunServer = import.meta.env.VITE_STUN_SERVER;
      const turnServer = import.meta.env.VITE_TURN_SERVER;
      const turnUsername = import.meta.env.VITE_TURN_USERNAME;
      const turnPassword = import.meta.env.VITE_TURN_PASSWORD;

      const iceServers: RTCIceServer[] = [];

      // STUN 서버 추가
      if (stunServer) {
        iceServers.push({ urls: stunServer });
      }

      // TURN 서버 추가 (인증 정보가 필수이므로 둘 다 있을 때만 추가)
      if (turnServer && turnUsername && turnPassword) {
        iceServers.push({
          urls: turnServer,
          username: turnUsername,
          credential: turnPassword,
        });
      }

      // 기본 STUN 서버 (환경 변수가 없을 경우 fallback)
      if (iceServers.length === 0) {
        iceServers.push(
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        );
      }

      const pc = new RTCPeerConnection({
        iceServers,
      });

      // 로컬 스트림을 peer connection에 추가
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 원격 스트림 처리
      pc.ontrack = (event) => {
        console.log("[WebRTC] ========== ontrack 이벤트 발생 ==========");
        console.log("[WebRTC] 원격 스트림 수신:", {
          streams: event.streams,
          track: event.track,
          trackKind: event.track.kind,
          trackId: event.track.id,
          trackReadyState: event.track.readyState,
        });
        if (event.streams && event.streams.length > 0) {
          setRemoteStream(event.streams[0]);
          console.log("[WebRTC] 원격 스트림 설정 완료:", event.streams[0]);
        }
      };

      // ICE candidate 처리
      pc.onicecandidate = (event) => {
        if (event.candidate && publishRef.current) {
          console.log("[WebRTC] ICE candidate 생성:", {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          });
          // ICE candidate를 WebSocket을 통해 전송
          publishRef.current(
            `/app/webrtc/ice`,
            JSON.stringify({
              candidate: event.candidate.toJSON(),
              userId,
            })
          );
          console.log("[WebRTC] ICE candidate 전송 완료");
        } else if (!event.candidate) {
          // 모든 ICE candidate 수집 완료
          console.log("[WebRTC] ========== ICE candidate 수집 완료 ==========");
        }
      };

      // ICE connection state 변경 처리 (WebRTC는 별도로 관리, 채팅은 WebSocket 연결 상태 사용)
      pc.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ========== ICE connection state 변경 ==========");
        console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
        console.log("[WebRTC] PC 상태:", {
          connectionState: pc.connectionState,
          signalingState: pc.signalingState,
          iceConnectionState: pc.iceConnectionState,
        });
        // WebSocket 연결 상태는 별도로 관리하므로 여기서는 isConnected를 변경하지 않음
      };

      // 연결 상태 변경 (WebRTC는 별도로 관리, 채팅은 WebSocket 연결 상태 사용)
      // WebRTC 연결 상태는 비디오/오디오 스트림에만 영향을 주고,
      // 채팅은 WebSocket 연결 상태를 사용하므로 여기서는 로그만 남김
      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] ========== 연결 상태 변경 ==========");
        console.log("[WebRTC] connection state:", pc.connectionState);
        console.log("[WebRTC] PC 상태:", {
          connectionState: pc.connectionState,
          signalingState: pc.signalingState,
          iceConnectionState: pc.iceConnectionState,
        });
        // WebSocket 연결 상태는 별도로 관리하므로 여기서는 isConnected를 변경하지 않음
      };

      pcRef.current = pc;
    } catch (err) {
      console.error("WebRTC 설정 실패:", err);
      setError("카메라/마이크 접근 권한이 필요합니다.");
      throw err; // 에러를 다시 throw하여 호출자가 처리할 수 있도록
    }
  }, [roomId, userId]);

  // 면접방 WebSocket 구독
  // interviewRoomId는 API 응답 후 업데이트되지만, roomId로도 구독 가능
  const { isConnected: wsConnected, publish: publishFromHook } =
    useInterviewRoomWebSocket({
      roomId,
      interviewRoomId: interviewRoomId, // ref 대신 state 사용
      userId,
      userName: userData?.data?.name,
      enabled: !!userId && !!roomId, // roomId만 있으면 구독 가능 (interviewRoomId는 나중에 업데이트됨)
      onChatReceived: (message) => {
        setMessages((prev) => [...prev, message]);
      },
      onUserJoined: () => {
        // user-joined는 이미 hook 내부에서 처리됨
      },
      onUserLeft: () => {
        // user-left는 로그만 남김
      },
      onAnswer: (answer) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            senderId: null,
            senderName: null,
            receiverId: null,
            receiverNickname: null,
            content: answer,
            timestamp: new Date().toISOString(),
            type: "SYSTEM_ANSWER",
          },
        ]);
      },
      onQuestion: (question) => {
        console.log("[InterviewRoom] 질문 수신:", question);
        setCurrentQuestion(question);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            senderId: null,
            senderName: null,
            receiverId: null,
            receiverNickname: null,
            content: question,
            timestamp: new Date().toISOString(),
            type: "SYSTEM_QUESTION",
          },
        ]);
      },
      onStatusUpdate: (status) => {
        setInterviewStatus(status);
      },
      onTailQuestions: (tailQuestions) => {
        console.log("[InterviewRoom] 꼬리 질문 수신:", tailQuestions);
        setTailQuestions(tailQuestions);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
      },
      pcRef,
      publishRef,
      offerSentRef,
      sendOfferWhenReadyRef,
      opponentInfoRef,
    });

  // publishRef 업데이트
  useEffect(() => {
    publishRef.current = publishFromHook;
  }, [publishFromHook, publishRef]);

  // WebSocket 연결 상태 동기화
  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  // 로컬 스트림이 준비된 후에만 offer 전송
  const sendOfferWhenReady = useCallback(async () => {
    // 이미 offer를 보냈으면 중복 전송 방지
    if (offerSentRef.current) {
      console.log("[WebRTC] 이미 offer를 전송했습니다.");
      return;
    }

    // 로컬 스트림과 peer connection이 준비될 때까지 대기
    const checkReady = () => {
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10초 대기 (100 * 100ms)
        const check = () => {
          attempts++;
          if (
            pcRef.current &&
            localStreamRef.current &&
            localStreamRef.current.getVideoTracks().length > 0 &&
            localStreamRef.current.getVideoTracks()[0].readyState === "live" &&
            wsConnected &&
            publishRef.current &&
            interviewRoomIdRef.current // interviewRoomId도 확인
          ) {
            console.log("[WebRTC] 모든 준비 완료, offer 전송 시작", {
              hasPc: !!pcRef.current,
              hasLocalStream: !!localStreamRef.current,
              videoTracksReady:
                localStreamRef.current.getVideoTracks().length > 0,
              wsConnected,
              hasPublish: !!publishRef.current,
              interviewRoomId: interviewRoomIdRef.current,
              attempts,
            });
            resolve();
          } else if (attempts >= maxAttempts) {
            console.error("[WebRTC] 준비 대기 시간 초과:", {
              hasPc: !!pcRef.current,
              hasLocalStream: !!localStreamRef.current,
              videoTracksReady: localStreamRef.current
                ? localStreamRef.current.getVideoTracks().length > 0
                : false,
              wsConnected,
              hasPublish: !!publishRef.current,
              interviewRoomId: interviewRoomIdRef.current,
            });
            reject(new Error("WebRTC 준비 시간 초과"));
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    try {
      await checkReady();
      console.log("[WebRTC] 로컬 스트림 준비 완료, offer 전송");

      if (
        pcRef.current &&
        !offerSentRef.current &&
        wsConnected &&
        publishRef.current &&
        interviewRoomIdRef.current // interviewRoomId도 확인
      ) {
        console.log("[WebRTC] Offer 생성 및 전송 중...");
        // Offer 생성
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        // Local description 설정
        await pcRef.current.setLocalDescription(offer);

        // Offer 전송
        publishRef.current(
          `/app/webrtc/offer`,
          JSON.stringify({
            offer: {
              type: offer.type,
              sdp: offer.sdp,
            },
            userId,
          })
        );
        offerSentRef.current = true;
        console.log("[WebRTC] Offer 전송 완료:", {
          destination: `/app/webrtc/offer`,
          userId,
        });
      } else {
        console.warn("[WebRTC] Offer 전송 실패:", {
          hasPc: !!pcRef.current,
          hasLocalStream: !!localStreamRef.current,
          alreadySent: offerSentRef.current,
          connected: wsConnected,
          hasPublish: !!publishRef.current,
          interviewRoomId: interviewRoomIdRef.current,
        });
      }
    } catch (err) {
      console.error("[WebRTC] Offer 전송 실패:", err);
    }
  }, [wsConnected, userId, pcRef, localStreamRef, offerSentRef, publishRef]);

  // sendOfferWhenReady를 ref에 저장하여 외부에서 접근 가능하게 함
  useEffect(() => {
    sendOfferWhenReadyRef.current = sendOfferWhenReady;
  }, [sendOfferWhenReady, sendOfferWhenReadyRef]);

  // 타이머 시작
  const startTimer = useCallback((duration: number) => {
    setTimeRemaining(duration);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 초기화
  useEffect(() => {
    if (!roomId || !userId) return;

    // 먼저 로컬 스트림을 설정하고, 완료된 후에 WebSocket 연결
    const initialize = async () => {
      let receivedInterviewRoomId: number | null = null;
      try {
        // 면접방 입장 API 호출
        const roomData = await joinInterviewRoom(roomId);
        if (roomData.success && roomData.data) {
          const data = roomData.data;

          // API 응답에서 받은 id 저장
          receivedInterviewRoomId = data.id;
          setInterviewRoomId(data.id);
          interviewRoomIdRef.current = data.id;

          // 상대방 정보 설정
          const opponent = {
            id: data.opponent.id,
            name: data.opponent.name,
            avatar: data.opponent.avatar,
          };
          setOpponentInfo(opponent);
          opponentInfoRef.current = opponent;

          // 면접 상태 설정
          setInterviewStatus(data.status);

          // 현재 질문 설정
          setCurrentQuestion(data.currentQuestion);

          // 채팅 히스토리 설정 (백엔드에서 받은 그대로 사용)
          const chatHistory: ChatMessage[] = data.chatHistory.map((msg) => ({
            id: Date.now().toString() + Math.random(),
            senderId: msg.senderId,
            senderName: msg.senderNickname,
            receiverId: msg.receiverId,
            receiverNickname: msg.receiverNickname,
            content: msg.message,
            timestamp: msg.createdAt,
            type: msg.type,
          }));
          setMessages(chatHistory);

          // 사용자 역할 확인 (면접관인지 면접자인지)
          // API 응답의 role 필드 사용
          if (data.role) {
            const determinedRole =
              data.role === "interviewer" ? "INTERVIEWER" : "INTERVIEWEE";
            console.log("[InterviewRoom] 역할 판단 (API 응답에서):", {
              roleFromApi: data.role,
              determinedRole,
            });
            setUserRole(determinedRole);
          } else {
            console.warn(
              "[InterviewRoom] API 응답에 role 필드가 없습니다:",
              data
            );
            // Fallback: opponent.id와 userId 비교
            const determinedRole =
              data.opponent.id !== userId ? "INTERVIEWER" : "INTERVIEWEE";
            console.log("[InterviewRoom] 역할 판단 (fallback):", {
              opponentId: data.opponent.id,
              userId: userId,
              determinedRole: determinedRole,
            });
            setUserRole(determinedRole);
          }
        }

        // 로컬 스트림 먼저 설정 (연결 상태와 관계없이 비디오 표시)
        await setupWebRTC();
        console.log("로컬 스트림 설정 완료");

        // 로컬 스트림이 준비된 후 WebSocket 연결 (API 응답에서 받은 id 전달)
        // WebSocket 연결은 useWebSocket hook에서 자동으로 처리됨
      } catch (err) {
        console.error("초기화 실패:", err);
        setError("면접방 입장에 실패했습니다.");
        // 에러가 발생해도 WebSocket은 연결 시도 (채팅 등은 가능, roomId 사용)
        // WebSocket 연결은 useWebSocket hook에서 자동으로 처리됨
      }
    };

    initialize();

    // 기본 타이머 (60분)
    startTimer(60 * 60);

    return () => {
      // 이미 leaveRoom이나 endInterview에서 API 호출했으면 중복 호출 방지
      if (hasLeftRoomRef.current) {
        return;
      }

      // 면접방 퇴장 API 호출 (API 응답에서 받은 id 사용)
      const currentRoomId = interviewRoomIdRef.current || roomId;
      if (currentRoomId) {
        hasLeftRoomRef.current = true;
        leaveInterviewRoom(String(currentRoomId)).catch((err) => {
          console.error("면접방 퇴장 실패:", err);
        });
      }

      // 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      // WebSocket 연결 해제는 useWebSocket hook에서 자동으로 처리됨
    };
  }, [roomId, userId, setupWebRTC, startTimer]);

  // 메시지 전송 (chat-send 이벤트)
  const sendMessage = useCallback(
    (content: string) => {
      if (!isConnected) {
        console.warn("[Chat] WebSocket이 연결되지 않았습니다.");
        return;
      }

      // API 응답에서 받은 id를 사용, 없으면 roomId 사용 (fallback)
      const currentRoomId = interviewRoomIdRef.current || roomId;
      const destination = `/app/interview/${currentRoomId}/chat-send`;
      const messageBody = {
        type: "USER",
        message: content,
      };

      console.log("[Chat] 메시지 전송:", {
        destination,
        message: content,
        connected: isConnected,
      });

      try {
        if (publishRef.current) {
          publishRef.current(destination, JSON.stringify(messageBody));
          console.log("[Chat] 메시지 전송 완료");
        }
      } catch (error) {
        console.error("[Chat] 메시지 전송 실패:", error);
      }
    },
    [roomId, interviewRoomIdRef, isConnected, publishRef]
  );

  // 면접 시작 (start 이벤트)
  const startInterview = useCallback(() => {
    if (isConnected && publishRef.current) {
      publishRef.current(`/app/interview/start`, JSON.stringify({}));
    }
  }, [isConnected, publishRef]);

  // 면접 완전 종료 (end 이벤트 전송)
  const endInterview = useCallback(async () => {
    // 웹소켓으로 면접 종료 이벤트 전송
    if (isConnected && publishRef.current) {
      publishRef.current(`/app/interview/end`, JSON.stringify({}));
      console.log("[Interview] 면접 종료 이벤트 전송");
    }

    // 면접방 퇴장 API 호출 (API 응답에서 받은 id 사용)
    const currentRoomId = interviewRoomIdRef.current || roomId;
    if (currentRoomId && !hasLeftRoomRef.current) {
      hasLeftRoomRef.current = true;
      try {
        await leaveInterviewRoom(String(currentRoomId));
      } catch (err) {
        console.error("면접방 퇴장 실패:", err);
      }
    }

    // 정리
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    // WebSocket 연결 해제는 useWebSocket hook에서 자동으로 처리됨
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setInterviewStatus("COMPLETED");
  }, [roomId, interviewRoomIdRef, hasLeftRoomRef, isConnected, publishRef]);

  // 방 나가기 (면접은 계속 진행, 단순히 페이지 이동)
  const leaveRoom = useCallback(() => {
    // 면접방 퇴장 API 호출 (면접은 종료하지 않음, API 응답에서 받은 id 사용)
    const currentRoomId = interviewRoomIdRef.current || roomId;
    if (currentRoomId && !hasLeftRoomRef.current) {
      hasLeftRoomRef.current = true;
      leaveInterviewRoom(String(currentRoomId)).catch((err) => {
        console.error("면접방 퇴장 실패:", err);
      });
    }

    // 정리 (스트림 등은 정리하되, 면접 종료 이벤트는 보내지 않음)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    // WebSocket 연결 해제는 useWebSocket hook에서 자동으로 처리됨
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [roomId]);

  // 로컬 오디오 (마이크) on/off
  const toggleLocalAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !isLocalAudioEnabled;
      });
      setIsLocalAudioEnabled(!isLocalAudioEnabled);
    }
  }, [isLocalAudioEnabled]);

  // 원격 오디오 on/off
  const toggleRemoteAudio = useCallback(() => {
    setIsRemoteAudioEnabled(!isRemoteAudioEnabled);
  }, [isRemoteAudioEnabled]);

  // 음성 녹음 시작/종료
  const toggleRecording = useCallback(async () => {
    if (!localStreamRef.current) {
      setError("마이크 스트림이 없습니다.");
      return;
    }

    if (isRecording) {
      // 녹음 종료
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // 녹음 시작
      try {
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length === 0) {
          setError("오디오 트랙을 찾을 수 없습니다.");
          return;
        }

        // 오디오 스트림 생성
        const audioStream = new MediaStream(audioTracks);

        // MediaRecorder 생성
        const mediaRecorder = new MediaRecorder(audioStream, {
          mimeType: "audio/webm;codecs=opus",
        });

        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(recordedChunksRef.current, {
            type: "audio/webm",
          });

          try {
            // 사용자 역할에 따라 다른 API 호출
            if (userRole === "INTERVIEWER") {
              // 면접관: 질문 생성
              await createQuestion(audioBlob);
              // 질문 생성 후 꼬리 질문 목록 비우기
              setTailQuestions([]);
            } else {
              // 면접자: 답변 제출
              await submitAnswer(audioBlob);
            }
          } catch (err) {
            console.error("음성 제출 실패:", err);
            setError("음성 제출에 실패했습니다.");
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("녹음 시작 실패:", err);
        setError("녹음을 시작할 수 없습니다.");
      }
    }
  }, [isRecording, userRole]);

  return {
    localStream,
    remoteStream,
    isConnected,
    opponentInfo,
    messages,
    interviewStatus,
    timeRemaining,
    sendMessage,
    startInterview,
    endInterview,
    leaveRoom,
    tailQuestions,
    currentQuestion,
    error,
    isLocalAudioEnabled,
    isRemoteAudioEnabled,
    toggleLocalAudio,
    toggleRemoteAudio,
    isRecording,
    toggleRecording,
    userRole,
  };
}
