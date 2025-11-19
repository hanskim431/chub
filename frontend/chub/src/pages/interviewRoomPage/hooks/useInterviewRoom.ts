import { useState, useEffect, useRef, useCallback } from "react";
import { Client, type Message as StompMessage } from "@stomp/stompjs";
// @ts-ignore - sockjs-client 타입 정의 없음
import SockJS from "sockjs-client";
import { useMe } from "@/features/auth/api/me";
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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const offerSentRef = useRef<boolean>(false); // offer 전송 여부 추적
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const sendOfferWhenReadyRef = useRef<(() => Promise<void>) | null>(null);

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
        setRemoteStream(event.streams[0]);
      };

      // ICE candidate 처리
      pc.onicecandidate = (event) => {
        if (event.candidate && stompClientRef.current?.connected) {
          // ICE candidate를 WebSocket을 통해 전송
          stompClientRef.current.publish({
            destination: `/app/webrtc/${roomId}/ice`,
            body: JSON.stringify({
              candidate: event.candidate.toJSON(),
              userId,
            }),
          });
        } else if (!event.candidate) {
          // 모든 ICE candidate 수집 완료
          console.log("ICE candidate 수집 완료");
        }
      };

      // ICE connection state 변경 처리 (WebRTC는 별도로 관리, 채팅은 WebSocket 연결 상태 사용)
      pc.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
        // WebSocket 연결 상태는 별도로 관리하므로 여기서는 isConnected를 변경하지 않음
      };

      // 연결 상태 변경 (WebRTC는 별도로 관리, 채팅은 WebSocket 연결 상태 사용)
      // WebRTC 연결 상태는 비디오/오디오 스트림에만 영향을 주고,
      // 채팅은 WebSocket 연결 상태를 사용하므로 여기서는 로그만 남김
      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] 연결 상태 변경:", pc.connectionState);
        // WebSocket 연결 상태는 별도로 관리하므로 여기서는 isConnected를 변경하지 않음
      };

      pcRef.current = pc;
    } catch (err) {
      console.error("WebRTC 설정 실패:", err);
      setError("카메라/마이크 접근 권한이 필요합니다.");
      throw err; // 에러를 다시 throw하여 호출자가 처리할 수 있도록
    }
  }, [roomId, userId]);

  // STOMP WebSocket 연결
  const connectWebSocket = useCallback(() => {
    const socket = new SockJS(
      `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/ws`
    );
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[WebSocket] 연결됨");
        // WebSocket 연결 시 isConnected를 true로 설정 (채팅 사용 가능)
        setIsConnected(true);

        // 면접방 입장 (joined 이벤트) - userId와 userName 포함
        const currentUserName = userData?.data?.name || "사용자";
        console.log("[WebSocket] 면접방 입장 이벤트 전송:", {
          destination: `/app/interview/${roomId}/joined`,
          userId,
          userName: currentUserName,
        });
        client.publish({
          destination: `/app/interview/${roomId}/joined`,
          body: JSON.stringify({
            userId: userId,
            userName: currentUserName,
          }),
        });

        // 브로드캐스트 이벤트 구독 (/topic/interview/{interviewRequestId})
        const topicDestination = `/topic/interview/${roomId}`;
        console.log("[WebSocket] 토픽 구독:", topicDestination);
        client.subscribe(topicDestination, (message: StompMessage) => {
          console.log("[WebSocket] 토픽 메시지 수신:", {
            destination: message.headers.destination,
            body: message.body,
          });
          const wsMessage: WebSocketMessage = JSON.parse(message.body);

          switch (wsMessage.type) {
            case "chat-received": {
              // 채팅 메시지 수신 (백엔드에서 받은 그대로 사용)
              console.log("[Chat] 메시지 수신:", wsMessage);
              const chatData = wsMessage.data as InterviewRoomChatMessage;
              const newMessage = {
                id: Date.now().toString() + Math.random(),
                senderId: chatData.senderId,
                senderName: chatData.senderNickname,
                receiverId: chatData.receiverId,
                receiverNickname: chatData.receiverNickname,
                content: chatData.message,
                timestamp: chatData.createdAt,
                type: chatData.type,
              };
              console.log("[Chat] 새 메시지 추가:", newMessage);
              setMessages((prev) => [...prev, newMessage]);
              break;
            }
            case "user-joined": {
              // 사용자 입장 알림 (채팅 메시지로 표시하지 않음)
              const joinData = wsMessage.data as {
                userId?: number;
                userName?: string;
              };
              const joinedUserId = joinData?.userId;
              console.log("[Interview] 사용자 입장:", joinData);

              // user-joined 이벤트를 받은 사람이 offer를 보냄
              // (자신이 보낸 이벤트가 아닌 경우에만, 즉 이미 방에 있던 사람이 새로 입장한 사람에게 offer를 보냄)
              if (
                joinedUserId &&
                joinedUserId !== userId &&
                !offerSentRef.current
              ) {
                console.log(
                  "[WebRTC] user-joined 이벤트 수신, offer 전송 시작",
                  {
                    joinedUserId,
                    currentUserId: userId,
                    offerAlreadySent: offerSentRef.current,
                  }
                );
                if (sendOfferWhenReadyRef.current) {
                  // 약간의 지연을 두어 로컬 스트림이 완전히 준비되도록 함
                  setTimeout(() => {
                    sendOfferWhenReadyRef.current?.();
                  }, 500);
                } else {
                  console.warn(
                    "[WebRTC] sendOfferWhenReady 함수가 아직 준비되지 않았습니다. 재시도 중..."
                  );
                  // sendOfferWhenReady가 아직 준비되지 않았다면 잠시 후 재시도
                  const retryInterval = setInterval(() => {
                    if (sendOfferWhenReadyRef.current) {
                      clearInterval(retryInterval);
                      console.log(
                        "[WebRTC] sendOfferWhenReady 준비 완료, offer 전송 시작"
                      );
                      sendOfferWhenReadyRef.current();
                    }
                  }, 100);
                  // 5초 후에도 준비되지 않으면 재시도 중단
                  setTimeout(() => {
                    clearInterval(retryInterval);
                  }, 5000);
                }
              }
              break;
            }
            case "user-left": {
              // 사용자 퇴장 알림 (채팅 메시지로 표시하지 않음)
              console.log("[Interview] 사용자 퇴장:", wsMessage.data);
              break;
            }
            case "answer": {
              // 면접자의 답변 (STT 변환 완료)
              const answerData = wsMessage.data as { answer: string };
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + Math.random(),
                  senderId: null,
                  senderName: null,
                  receiverId: null,
                  receiverNickname: null,
                  content: answerData.answer,
                  timestamp: wsMessage.timestamp,
                  type: "SYSTEM_ANSWER",
                },
              ]);
              break;
            }
            case "question": {
              // 면접관의 질문 (STT 변환 완료)
              const questionData = wsMessage.data as { question: string };
              setCurrentQuestion(questionData.question);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + Math.random(),
                  senderId: null,
                  senderName: null,
                  receiverId: null,
                  receiverNickname: null,
                  content: questionData.question,
                  timestamp: wsMessage.timestamp,
                  type: "SYSTEM_QUESTION",
                },
              ]);
              break;
            }
            case "status-update": {
              // 면접 상태 업데이트
              const status = wsMessage.data as string;
              setInterviewStatus(status);
              break;
            }
          }
        });

        // 개인 큐 구독 (/user/queue) - 꼬리 질문은 면접관에게만 제공
        if (userId) {
          const queueDestination = `/user/${userId}/queue`;
          console.log("[WebSocket] 개인 큐 구독:", queueDestination);
          client.subscribe(queueDestination, (message: StompMessage) => {
            console.log("[WebSocket] 개인 큐 메시지 수신:", {
              destination: message.headers.destination,
              body: message.body,
            });
            const wsMessage: WebSocketMessage = JSON.parse(message.body);

            switch (wsMessage.type) {
              case "tail-questions": {
                // 꼬리 질문 선택지 제공 (면접관에게만)
                const tailData = wsMessage.data as { tailQuestions: string[] };
                console.log("[WebSocket] 꼬리 질문 수신:", tailData);
                setTailQuestions(tailData.tailQuestions);
                break;
              }
              case "error": {
                // 에러 메시지
                const errorMessage = wsMessage.data as string;
                console.error("[WebSocket] 에러 메시지:", errorMessage);
                setError(errorMessage);
                break;
              }
            }
          });
        }

        // WebRTC 시그널링 구독 (/topic/webrtc/{interviewRequestId})
        const webrtcTopicDestination = `/topic/webrtc/${roomId}`;
        console.log("[WebRTC] WebRTC 토픽 구독:", webrtcTopicDestination);
        client.subscribe(
          webrtcTopicDestination,
          async (message: StompMessage) => {
            try {
              console.log("[WebRTC] WebRTC 메시지 수신:", {
                destination: message.headers.destination,
                body: message.body,
              });
              const wsMessage: WebSocketMessage = JSON.parse(message.body);
              const data = wsMessage.data as any;

              // 자신이 보낸 메시지는 무시
              if (data.userId === userId) {
                console.log("[WebRTC] 자신이 보낸 메시지 무시:", data.userId);
                return;
              }

              switch (wsMessage.type) {
                case "offer": {
                  // Offer 수신 (상대방이 offer를 보냈을 때)
                  if (pcRef.current && data.offer) {
                    console.log("Offer 수신, Answer 생성 중...");
                    // 원격 offer 설정
                    await pcRef.current.setRemoteDescription(
                      new RTCSessionDescription(data.offer)
                    );

                    // Answer 생성 및 전송
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);

                    client.publish({
                      destination: `/app/webrtc/${roomId}/answer`,
                      body: JSON.stringify({
                        answer: {
                          type: answer.type,
                          sdp: answer.sdp,
                        },
                        userId,
                      }),
                    });
                    console.log("Answer 전송 완료");
                  }
                  break;
                }
                case "answer": {
                  // Answer 수신 (상대방이 answer를 보냈을 때)
                  if (pcRef.current && data.answer) {
                    console.log("Answer 수신");
                    // 원격 answer 설정
                    await pcRef.current.setRemoteDescription(
                      new RTCSessionDescription(data.answer)
                    );
                  }
                  break;
                }
                case "ice-candidate": {
                  // ICE candidate 수신
                  if (pcRef.current && data.candidate) {
                    // 원격 ICE candidate 추가
                    await pcRef.current.addIceCandidate(
                      new RTCIceCandidate(data.candidate)
                    );
                    console.log("ICE candidate 추가됨");
                  }
                  break;
                }
              }
            } catch (error) {
              console.error("WebRTC 시그널링 처리 실패:", error);
              setError("WebRTC 연결 설정에 실패했습니다.");
            }
          }
        );

        // 로컬 스트림이 준비된 후에만 offer 전송
        const sendOfferWhenReady = async () => {
          // 이미 offer를 보냈으면 중복 전송 방지
          if (offerSentRef.current) {
            console.log("[WebRTC] 이미 offer를 전송했습니다.");
            return;
          }

          // 로컬 스트림과 peer connection이 준비될 때까지 대기
          const checkReady = () => {
            return new Promise<void>((resolve) => {
              const check = () => {
                if (
                  pcRef.current &&
                  localStreamRef.current &&
                  localStreamRef.current.getVideoTracks().length > 0 &&
                  localStreamRef.current.getVideoTracks()[0].readyState ===
                    "live"
                ) {
                  resolve();
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

            if (pcRef.current && !offerSentRef.current && client.connected) {
              console.log("[WebRTC] Offer 생성 및 전송 중...");
              // Offer 생성
              const offer = await pcRef.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });

              // Local description 설정
              await pcRef.current.setLocalDescription(offer);

              // Offer 전송
              client.publish({
                destination: `/app/webrtc/${roomId}/offer`,
                body: JSON.stringify({
                  offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                  },
                  userId,
                }),
              });
              offerSentRef.current = true;
              console.log("[WebRTC] Offer 전송 완료:", {
                destination: `/app/webrtc/${roomId}/offer`,
                userId,
              });
            } else {
              console.warn("[WebRTC] Offer 전송 실패:", {
                hasPc: !!pcRef.current,
                alreadySent: offerSentRef.current,
                connected: client.connected,
              });
            }
          } catch (err) {
            console.error("[WebRTC] Offer 전송 실패:", err);
          }
        };

        // sendOfferWhenReady를 ref에 저장하여 외부에서 접근 가능하게 함
        sendOfferWhenReadyRef.current = sendOfferWhenReady;
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        setError("WebSocket 연결에 실패했습니다.");
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log("[WebSocket] 연결 해제됨");
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log("[WebSocket] WebSocket 닫힘");
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  }, [roomId, userId, userData]);

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
      try {
        // 면접방 입장 API 호출
        const roomData = await joinInterviewRoom(roomId);
        if (roomData.success && roomData.data) {
          const data = roomData.data;

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
          // opponent.id와 userId를 비교하여 역할 판단
          // 실제로는 API 응답에서 역할 정보를 받아야 함
          // 임시로 opponent.id !== userId로 판단
          // TODO: API 응답에 역할 정보 추가 필요
          // 면접관은 opponent.id와 다르고, 면접자는 opponent.id와 같거나 다를 수 있음
          // 일단 임시로 opponent.id !== userId면 면접관으로 설정
          if (data.opponent.id !== userId) {
            setUserRole("INTERVIEWER");
          } else {
            setUserRole("INTERVIEWEE");
          }
        }

        // 로컬 스트림 먼저 설정 (연결 상태와 관계없이 비디오 표시)
        await setupWebRTC();
        console.log("로컬 스트림 설정 완료");

        // 로컬 스트림이 준비된 후 WebSocket 연결
        connectWebSocket();
      } catch (err) {
        console.error("초기화 실패:", err);
        setError("면접방 입장에 실패했습니다.");
        // 에러가 발생해도 WebSocket은 연결 시도 (채팅 등은 가능)
        connectWebSocket();
      }
    };

    initialize();

    // 기본 타이머 (60분)
    startTimer(60 * 60);

    return () => {
      // 면접방 퇴장 API 호출
      if (roomId) {
        leaveInterviewRoom(roomId).catch((err) => {
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
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [roomId, userId, setupWebRTC, connectWebSocket, startTimer]);

  // 메시지 전송 (chat-send 이벤트)
  const sendMessage = useCallback(
    (content: string) => {
      if (!stompClientRef.current) {
        console.warn("[Chat] STOMP 클라이언트가 없습니다.");
        return;
      }

      if (!stompClientRef.current.connected) {
        console.warn("[Chat] WebSocket이 연결되지 않았습니다.");
        return;
      }

      const destination = `/app/interview/${roomId}/chat-send`;
      const messageBody = {
        type: "USER",
        message: content,
      };

      console.log("[Chat] 메시지 전송:", {
        destination,
        message: content,
        connected: stompClientRef.current.connected,
      });

      try {
        stompClientRef.current.publish({
          destination,
          body: JSON.stringify(messageBody),
        });
        console.log("[Chat] 메시지 전송 완료");
      } catch (error) {
        console.error("[Chat] 메시지 전송 실패:", error);
      }
    },
    [roomId]
  );

  // 면접 시작 (start 이벤트)
  const startInterview = useCallback(() => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/interview/start`,
        body: JSON.stringify({}),
      });
    }
  }, []);

  // 면접 완전 종료 (end 이벤트 전송)
  const endInterview = useCallback(async () => {
    // 웹소켓으로 면접 종료 이벤트 전송
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/interview/end`,
        body: JSON.stringify({}),
      });
      console.log("[Interview] 면접 종료 이벤트 전송");
    }

    // 면접방 퇴장 API 호출
    if (roomId) {
      try {
        await leaveInterviewRoom(roomId);
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
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setInterviewStatus("COMPLETED");
  }, [roomId]);

  // 방 나가기 (면접은 계속 진행, 단순히 페이지 이동)
  const leaveRoom = useCallback(() => {
    // 면접방 퇴장 API 호출 (면접은 종료하지 않음)
    if (roomId) {
      leaveInterviewRoom(roomId).catch((err) => {
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
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
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
