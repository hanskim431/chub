import { useEffect, useRef, useCallback } from "react";
import type { Message as StompMessage } from "@stomp/stompjs";
import { useWebSocket } from "@/shared/websocket/useWebSocket";

interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

interface InterviewRoomChatMessage {
  type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
  senderId: number | null;
  senderNickname: string | null;
  receiverId: number | null;
  receiverNickname: string | null;
  message: string;
  createdAt: string;
}

interface UseInterviewRoomWebSocketProps {
  roomId: string;
  interviewRoomId: number | null; // API 응답에서 받은 id
  userId: number | undefined;
  userName: string | undefined;
  enabled?: boolean;
  // 콜백 함수들
  onChatReceived?: (message: {
    id: string;
    senderId: number | null;
    senderName: string | null;
    receiverId: number | null;
    receiverNickname: string | null;
    content: string;
    timestamp: string;
    type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
  }) => void;
  onUserJoined?: () => void;
  onUserLeft?: () => void;
  onAnswer?: (answer: string) => void;
  onQuestion?: (question: string) => void;
  onStatusUpdate?: (status: string) => void;
  onTailQuestions?: (tailQuestions: string[]) => void;
  onError?: (error: string) => void;
  onWebRTCOffer?: (offer: RTCSessionDescriptionInit) => Promise<void>;
  onWebRTCAnswer?: (answer: RTCSessionDescriptionInit) => Promise<void>;
  onWebRTCIce?: (candidate: RTCIceCandidateInit) => Promise<void>;
  // WebRTC 관련 refs
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  publishRef: React.MutableRefObject<
    ((destination: string, body: string) => boolean) | null
  >;
  offerSentRef: React.MutableRefObject<boolean>;
  sendOfferWhenReadyRef: React.MutableRefObject<(() => Promise<void>) | null>;
  opponentInfoRef: React.MutableRefObject<{ id: number } | null>;
}

export function useInterviewRoomWebSocket({
  roomId,
  interviewRoomId,
  userId,
  userName,
  enabled = true,
  onChatReceived,
  onUserJoined,
  onUserLeft,
  onAnswer,
  onQuestion,
  onStatusUpdate,
  onTailQuestions,
  onError,
  onWebRTCOffer,
  onWebRTCAnswer,
  onWebRTCIce,
  pcRef,
  publishRef,
  offerSentRef,
  sendOfferWhenReadyRef,
  opponentInfoRef,
}: UseInterviewRoomWebSocketProps) {
  // WebSocket 연결은 전역에서 관리, 여기서는 구독/해제만 담당
  const { isConnected, subscribe, unsubscribe, publish } = useWebSocket();

  // subscribe/unsubscribe/publish 함수를 ref로 저장하여 안정적인 참조 유지
  const subscribeRef = useRef(subscribe);
  const unsubscribeRef = useRef(unsubscribe);
  const publishRefForHook = useRef(publish);

  useEffect(() => {
    subscribeRef.current = subscribe;
    unsubscribeRef.current = unsubscribe;
    publishRefForHook.current = publish;
  }, [subscribe, unsubscribe, publish]);

  // 콜백 함수들을 ref로 저장하여 dependency 변경 방지
  const callbacksRef = useRef({
    onChatReceived,
    onUserJoined,
    onUserLeft,
    onAnswer,
    onQuestion,
    onStatusUpdate,
    onTailQuestions,
    onError,
    onWebRTCOffer,
    onWebRTCAnswer,
    onWebRTCIce,
  });

  // 콜백 ref 업데이트
  useEffect(() => {
    callbacksRef.current = {
      onChatReceived,
      onUserJoined,
      onUserLeft,
      onAnswer,
      onQuestion,
      onStatusUpdate,
      onTailQuestions,
      onError,
      onWebRTCOffer,
      onWebRTCAnswer,
      onWebRTCIce,
    };
  }, [
    onChatReceived,
    onUserJoined,
    onUserLeft,
    onAnswer,
    onQuestion,
    onStatusUpdate,
    onTailQuestions,
    onError,
    onWebRTCOffer,
    onWebRTCAnswer,
    onWebRTCIce,
  ]);

  // publishRef 업데이트
  useEffect(() => {
    publishRef.current = publish;
  }, [publish, publishRef]);

  // 면접방 WebSocket 구독 및 이벤트 처리
  useEffect(() => {
    if (!isConnected || !userId || !enabled) {
      // enabled가 false이거나 연결되지 않았으면 구독하지 않음
      return;
    }

    // API 응답에서 받은 id를 사용, 없으면 roomId 사용 (fallback)
    const currentRoomId = interviewRoomId || roomId;

    // 면접방 입장 (joined 이벤트) - userId와 userName 포함
    const currentUserName = userName || "사용자";
    console.log("[WebSocket] 면접방 입장 이벤트 전송:", {
      destination: `/app/interview/${currentRoomId}/joined`,
      userId,
      userName: currentUserName,
    });
    publishRefForHook.current(
      `/app/interview/${currentRoomId}/joined`,
      JSON.stringify({
        userId: userId,
        userName: currentUserName,
      })
    );

    // 브로드캐스트 이벤트 구독 (/topic/interview/{interviewRequestId})
    const topicDestination = `/topic/interview/${currentRoomId}`;
    console.log("[WebSocket] 토픽 구독:", topicDestination);
    const unsubscribeTopic = subscribeRef.current(
      topicDestination,
      (message: StompMessage) => {
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
            callbacksRef.current.onChatReceived?.(newMessage);
            break;
          }
          case "user-joined": {
            // 사용자 입장 알림
            console.log("[Interview] 상대방 입장:", {
              opponentId: opponentInfoRef.current?.id,
              currentUserId: userId,
            });

            // user-joined 이벤트를 받은 사람(먼저 방에 들어온 사람)이 offer를 보냄
            if (opponentInfoRef.current && !offerSentRef.current) {
              console.log(
                "[WebRTC] user-joined 이벤트 수신, offer 전송 시작",
                {
                  opponentId: opponentInfoRef.current.id,
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
            callbacksRef.current.onUserJoined?.();
            break;
          }
          case "user-left": {
            // 사용자 퇴장 알림
            console.log("[Interview] 사용자 퇴장:", wsMessage.data);
            callbacksRef.current.onUserLeft?.();
            break;
          }
          case "answer": {
            // 면접자의 답변 (STT 변환 완료)
            const answerData = wsMessage.data as { answer: string };
            callbacksRef.current.onAnswer?.(answerData.answer);
            break;
          }
          case "question": {
            // 면접관의 질문 (STT 변환 완료)
            const questionData = wsMessage.data as { question: string };
            callbacksRef.current.onQuestion?.(questionData.question);
            break;
          }
          case "status-update": {
            // 면접 상태 업데이트
            const status = wsMessage.data as string;
            callbacksRef.current.onStatusUpdate?.(status);
            break;
          }
        }
      }
    );

    // 개인 큐 구독 (/user/queue/interviewRoom) - 꼬리 질문, WebRTC 이벤트 등
    const queueDestination = `/user/queue/interviewRoom`;
    console.log("[WebSocket] 개인 큐 구독:", queueDestination);
    const unsubscribeQueue = subscribeRef.current(
      queueDestination,
      async (message: StompMessage) => {
        console.log("[WebSocket] 개인 큐 메시지 수신:", {
          destination: message.headers.destination,
          body: message.body,
        });
        const wsMessage: WebSocketMessage = JSON.parse(message.body);

        switch (wsMessage.type) {
          case "tail-questions": {
            // 꼬리 질문 선택지 제공 (면접관에게만)
            const tailData = wsMessage.data as {
              tailQuestions: string[];
            };
            console.log("[WebSocket] 꼬리 질문 수신:", tailData);
            callbacksRef.current.onTailQuestions?.(tailData.tailQuestions);
            break;
          }
          case "error": {
            // 에러 메시지
            const errorMessage = wsMessage.data as string;
            console.error("[WebSocket] 에러 메시지:", errorMessage);
            callbacksRef.current.onError?.(errorMessage);
            break;
          }
          case "webrtc-offer": {
            // Offer 수신 (상대방이 offer를 보냈을 때)
            try {
              const data = wsMessage.data as any;
              if (pcRef.current && data.offer) {
                console.log("[WebRTC] Offer 수신, Answer 생성 중...");
                // 원격 offer 설정
                await pcRef.current.setRemoteDescription(
                  new RTCSessionDescription(data.offer)
                );

                // Answer 생성 및 전송
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);

                if (publishRefForHook.current) {
                  const success = publishRefForHook.current(
                    `/app/webrtc/answer`,
                    JSON.stringify({
                      answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                      },
                      userId,
                    })
                  );
                  if (success) {
                    console.log("[WebRTC] Answer 전송 완료:", {
                      destination: `/app/webrtc/answer`,
                      userId,
                    });
                  } else {
                    console.error("[WebRTC] Answer 전송 실패");
                  }
                } else {
                  console.error("[WebRTC] publishRefForHook.current가 null입니다.");
                }
                callbacksRef.current.onWebRTCOffer?.(data.offer);
              }
            } catch (error) {
              console.error("[WebRTC] Offer 처리 실패:", error);
              callbacksRef.current.onError?.("WebRTC 연결 설정에 실패했습니다.");
            }
            break;
          }
          case "webrtc-answer": {
            // Answer 수신 (상대방이 answer를 보냈을 때)
            try {
              const data = wsMessage.data as any;
              if (pcRef.current && data.answer) {
                console.log("[WebRTC] Answer 수신");
                // 원격 answer 설정
                await pcRef.current.setRemoteDescription(
                  new RTCSessionDescription(data.answer)
                );
                callbacksRef.current.onWebRTCAnswer?.(data.answer);
              }
            } catch (error) {
              console.error("[WebRTC] Answer 처리 실패:", error);
              callbacksRef.current.onError?.("WebRTC 연결 설정에 실패했습니다.");
            }
            break;
          }
          case "webrtc-ice": {
            // ICE candidate 수신
            try {
              const data = wsMessage.data as any;
              if (pcRef.current && data.candidate) {
                // 원격 ICE candidate 추가
                await pcRef.current.addIceCandidate(
                  new RTCIceCandidate(data.candidate)
                );
                console.log("[WebRTC] ICE candidate 추가됨");
                callbacksRef.current.onWebRTCIce?.(data.candidate);
              }
            } catch (error) {
              console.error("[WebRTC] ICE candidate 처리 실패:", error);
            }
            break;
          }
        }
      }
    );

    // cleanup
    return () => {
      unsubscribeTopic();
      unsubscribeQueue();
    };
  }, [
    isConnected,
    userId,
    roomId,
    interviewRoomId,
    userName,
    enabled,
    // subscribe/unsubscribe/publish는 ref를 통해 접근하므로 dependency에서 제외
    // 콜백 함수들은 ref를 통해 접근하므로 dependency에서 제외
    pcRef,
    publishRef,
    offerSentRef,
    sendOfferWhenReadyRef,
    opponentInfoRef,
  ]);

  return {
    isConnected,
    publish,
  };
}

