import { useState, useEffect, useRef, useCallback } from "react";
import { Client, type Message as StompMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMe } from "@/features/auth/api/me";

interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: "CHAT" | "SYSTEM";
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

type InterviewStatus = "WAITING" | "QUESTION" | "ANSWER" | "COMPLETED";

export function useInterviewRoom(roomId: string, navigate?: (path: string) => void) {
  const { data: userData } = useMe();
  const userId = userData?.data?.id;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("WAITING");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

      // RTCPeerConnection 생성
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
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
          stompClientRef.current.publish({
            destination: `/app/interview/${roomId}/ice-candidate`,
            body: JSON.stringify({
              candidate: event.candidate,
              userId,
            }),
          });
        }
      };

      // 연결 상태 변경
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setIsConnected(true);
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setIsConnected(false);
        }
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
    const socket = new SockJS(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket 연결됨");

        // 면접방 입장
        client.publish({
          destination: `/app/interview/${roomId}/join`,
          body: JSON.stringify({ userId }),
        });

        // 채팅 메시지 구독
        client.subscribe(`/topic/interview/${roomId}/chat`, (message: StompMessage) => {
          const data = JSON.parse(message.body);
          setMessages((prev) => [
            ...prev,
            {
              id: data.id || Date.now().toString(),
              senderId: data.senderId,
              senderName: data.senderName,
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString(),
              type: "CHAT",
            },
          ]);
        });

        // 시스템 메시지 구독
        client.subscribe(`/topic/interview/${roomId}/system`, (message: StompMessage) => {
          const data = JSON.parse(message.body);
          setMessages((prev) => [
            ...prev,
            {
              id: data.id || Date.now().toString(),
              senderId: 0,
              senderName: "시스템",
              content: data.message,
              timestamp: data.timestamp || new Date().toISOString(),
              type: "SYSTEM",
            },
          ]);

          // 면접 상태 변경
          if (data.status) {
            setInterviewStatus(data.status);
          }

          // 상대방 정보 업데이트
          if (data.opponentInfo) {
            setOpponentInfo(data.opponentInfo);
          }
        });

        // WebRTC 시그널링 구독
        client.subscribe(`/user/interview/${roomId}/offer`, async (message: StompMessage) => {
          const data = JSON.parse(message.body);
          if (pcRef.current && data.offer) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            client.publish({
              destination: `/app/interview/${roomId}/answer`,
              body: JSON.stringify({
                answer,
                userId,
              }),
            });
          }
        });

        client.subscribe(`/user/interview/${roomId}/answer`, async (message: StompMessage) => {
          const data = JSON.parse(message.body);
          if (pcRef.current && data.answer) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });

        client.subscribe(`/user/interview/${roomId}/ice-candidate`, async (message: StompMessage) => {
          const data = JSON.parse(message.body);
          if (pcRef.current && data.candidate) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        });

        // 로컬 스트림이 준비된 후에만 offer 전송
        const sendOfferWhenReady = async () => {
          // 로컬 스트림과 peer connection이 준비될 때까지 대기
          const checkReady = () => {
            return new Promise<void>((resolve) => {
              const check = () => {
                if (
                  pcRef.current &&
                  localStreamRef.current &&
                  localStreamRef.current.getVideoTracks().length > 0 &&
                  localStreamRef.current.getVideoTracks()[0].readyState === "live"
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
            console.log("로컬 스트림 준비 완료, offer 전송");

            if (pcRef.current) {
              const offer = await pcRef.current.createOffer();
              await pcRef.current.setLocalDescription(offer);
              client.publish({
                destination: `/app/interview/${roomId}/offer`,
                body: JSON.stringify({
                  offer,
                  userId,
                }),
              });
            }
          } catch (err) {
            console.error("Offer 전송 실패:", err);
          }
        };

        // offer 전송 시도
        sendOfferWhenReady();
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        setError("WebSocket 연결에 실패했습니다.");
      },
    });

    client.activate();
    stompClientRef.current = client;
  }, [roomId, userId]);

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
        // 로컬 스트림 먼저 설정 (연결 상태와 관계없이 비디오 표시)
        await setupWebRTC();
        console.log("로컬 스트림 설정 완료");
        
        // 로컬 스트림이 준비된 후 WebSocket 연결
        connectWebSocket();
      } catch (err) {
        console.error("초기화 실패:", err);
        // 에러가 발생해도 WebSocket은 연결 시도 (채팅 등은 가능)
        connectWebSocket();
      }
    };

    initialize();

    // 기본 타이머 (60분)
    startTimer(60 * 60);

    return () => {
      // 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
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

  // 메시지 전송
  const sendMessage = useCallback(
    (content: string) => {
      if (stompClientRef.current?.connected && userId && userData?.data) {
        stompClientRef.current.publish({
          destination: `/app/interview/${roomId}/chat`,
          body: JSON.stringify({
            content,
            senderId: userId,
            senderName: userData.data.name,
          }),
        });
      }
    },
    [roomId, userId, userData]
  );

  // 면접 종료
  const endInterview = useCallback(() => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/interview/${roomId}/end`,
        body: JSON.stringify({ userId }),
      });
    }

    // 정리
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
  }, [roomId, userId]);

  return {
    localStream,
    remoteStream,
    isConnected,
    opponentInfo,
    messages,
    interviewStatus,
    timeRemaining,
    sendMessage,
    endInterview,
    error,
  };
}

