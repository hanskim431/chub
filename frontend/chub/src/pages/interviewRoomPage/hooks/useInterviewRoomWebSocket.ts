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
            // 이전에 offer를 보냈어도 다시 보내도록 offerSentRef 체크 제거
            if (opponentInfoRef.current) {
              console.log("[WebRTC] user-joined 이벤트 수신, offer 전송 시작", {
                opponentId: opponentInfoRef.current.id,
                currentUserId: userId,
                offerAlreadySent: offerSentRef.current,
              });
              // offer를 다시 보낼 수 있도록 플래그 리셋
              offerSentRef.current = false;

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
          messageType: message.body
            ? JSON.parse(message.body)?.type
            : "unknown",
        });

        let wsMessage: WebSocketMessage;
        try {
          wsMessage = JSON.parse(message.body);
          console.log("[WebSocket] 파싱된 메시지:", wsMessage);
        } catch (error) {
          console.error("[WebSocket] 메시지 파싱 실패:", error, message.body);
          return;
        }

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
            console.log(
              "[WebRTC] ========== webrtc-offer 이벤트 수신 =========="
            );
            console.log("[WebRTC] 전체 메시지:", wsMessage);
            console.log("[WebRTC] 메시지 타입:", wsMessage.type);
            console.log("[WebRTC] 메시지 데이터:", wsMessage.data);
            console.log("[WebRTC] 메시지 데이터 타입:", typeof wsMessage.data);
            console.log(
              "[WebRTC] 메시지 데이터 키:",
              wsMessage.data ? Object.keys(wsMessage.data) : "없음"
            );

            try {
              const data = wsMessage.data as any;

              // 백엔드가 받은 문자열을 그대로 전달하므로, 항상 파싱 필요
              let parsedData = data;

              // data가 문자열이면 파싱
              if (typeof data === "string") {
                try {
                  // base64 인코딩된 문자열인지 확인 (일반적으로 base64는 알파벳, 숫자, +, /, =로 구성)
                  let jsonString = data;
                  if (/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 20) {
                    // base64로 보이는 경우 디코딩 시도
                    try {
                      jsonString = atob(data);
                      console.log("[WebRTC] base64 디코딩 완료");
                    } catch (base64Error) {
                      // base64 디코딩 실패하면 그냥 원본 문자열 사용
                      console.log(
                        "[WebRTC] base64 디코딩 실패, 원본 문자열 사용"
                      );
                    }
                  }

                  parsedData = JSON.parse(jsonString);
                  console.log("[WebRTC] 문자열 데이터 파싱 완료:", parsedData);
                } catch (e) {
                  console.error(
                    "[WebRTC] 문자열 데이터 파싱 실패:",
                    e,
                    "원본 데이터:",
                    data?.substring(0, 100)
                  );
                  callbacksRef.current.onError?.(
                    "Offer 데이터 파싱에 실패했습니다."
                  );
                  break;
                }
              } else {
                // 이미 객체인 경우도 있을 수 있음 (Spring이 자동 직렬화한 경우)
                console.log("[WebRTC] 데이터가 이미 객체입니다:", parsedData);
              }

              console.log("[WebRTC] Offer 데이터 분석:", {
                hasPc: !!pcRef.current,
                hasOffer: !!parsedData?.offer,
                offerType: parsedData?.offer?.type,
                offerSdp: parsedData?.offer?.sdp
                  ? `${parsedData.offer.sdp.substring(0, 50)}...`
                  : "없음",
                data: parsedData,
                dataKeys: parsedData ? Object.keys(parsedData) : [],
                userId: userId,
                hasPublishRef: !!publishRefForHook.current,
                pcState: pcRef.current?.connectionState,
                pcSignalingState: pcRef.current?.signalingState,
              });

              // offer가 직접 data에 있는지, 또는 data.offer에 있는지 확인
              let offerData = parsedData?.offer;

              // 만약 data.offer가 없고 data 자체가 offer 형식이면
              if (!offerData && parsedData?.type && parsedData?.sdp) {
                console.log("[WebRTC] data 자체가 offer 형식입니다.");
                offerData = parsedData;
              }

              if (!offerData) {
                console.error("[WebRTC] offer 데이터를 찾을 수 없습니다:", {
                  parsedData,
                  hasOffer: !!parsedData?.offer,
                  hasType: !!parsedData?.type,
                  hasSdp: !!parsedData?.sdp,
                });
                callbacksRef.current.onError?.("Offer 데이터가 없습니다.");
                break;
              }

              if (!userId) {
                console.error("[WebRTC] userId가 없습니다.");
                callbacksRef.current.onError?.("사용자 ID가 없습니다.");
                break;
              }

              // pcRef가 준비될 때까지 대기하는 함수
              const waitForPcReady = (): Promise<RTCPeerConnection> => {
                return new Promise((resolve, reject) => {
                  let attempts = 0;
                  const maxAttempts = 50; // 5초 대기

                  const check = () => {
                    attempts++;
                    if (pcRef.current) {
                      console.log(
                        "[WebRTC] pcRef 준비 완료, attempts:",
                        attempts
                      );
                      resolve(pcRef.current);
                    } else if (attempts >= maxAttempts) {
                      reject(new Error("pcRef가 준비되지 않았습니다."));
                    } else {
                      setTimeout(check, 100);
                    }
                  };
                  check();
                });
              };

              // pcRef가 준비될 때까지 대기
              let pc: RTCPeerConnection;
              if (!pcRef.current) {
                console.log("[WebRTC] pcRef가 아직 준비되지 않음, 대기 중...");
                try {
                  pc = await waitForPcReady();
                  console.log("[WebRTC] pcRef 준비 완료, Answer 생성 시작");
                } catch (error) {
                  console.error("[WebRTC] pcRef 대기 실패:", error);
                  callbacksRef.current.onError?.(
                    "WebRTC 연결이 초기화되지 않았습니다."
                  );
                  break;
                }
              } else {
                pc = pcRef.current;
              }

              if (!publishRefForHook.current) {
                console.error(
                  "[WebRTC] publishRefForHook.current가 null입니다."
                );
                callbacksRef.current.onError?.(
                  "WebSocket publish 함수가 없습니다."
                );
                break;
              }

              console.log(
                "[WebRTC] ========== Offer 수신, Answer 생성 시작 =========="
              );
              console.log("[WebRTC] PC 상태:", {
                connectionState: pc.connectionState,
                signalingState: pc.signalingState,
                iceConnectionState: pc.iceConnectionState,
              });

              // 원격 offer 설정
              await pc.setRemoteDescription(
                new RTCSessionDescription(offerData)
              );
              console.log("[WebRTC] Remote description 설정 완료");

              // Answer 생성 및 전송
              const answer = await pc.createAnswer();
              console.log("[WebRTC] Answer 생성 완료:", answer.type);
              await pc.setLocalDescription(answer);
              console.log("[WebRTC] Local description 설정 완료");

              const answerPayload = {
                answer: {
                  type: answer.type,
                  sdp: answer.sdp,
                },
                userId,
              };

              console.log("[WebRTC] ========== Answer 전송 시도 ==========");
              console.log("[WebRTC] destination: /app/webrtc/answer");
              console.log("[WebRTC] payload:", answerPayload);
              console.log(
                "[WebRTC] publishRefForHook.current:",
                !!publishRefForHook.current
              );

              const success = publishRefForHook.current(
                `/app/webrtc/answer`,
                JSON.stringify(answerPayload)
              );

              if (success) {
                console.log("[WebRTC] ========== Answer 전송 완료 ==========");
                console.log("[WebRTC] destination: /app/webrtc/answer");
                console.log("[WebRTC] userId:", userId);
                console.log("[WebRTC] answerType:", answer.type);
              } else {
                console.error(
                  "[WebRTC] ========== Answer 전송 실패 =========="
                );
                console.error("[WebRTC] publish 함수가 false를 반환했습니다.");
                callbacksRef.current.onError?.("Answer 전송에 실패했습니다.");
              }

              callbacksRef.current.onWebRTCOffer?.(offerData);
            } catch (error) {
              console.error("[WebRTC] Offer 처리 실패:", error);
              callbacksRef.current.onError?.(
                "WebRTC 연결 설정에 실패했습니다."
              );
            }
            break;
          }
          case "webrtc-answer": {
            // Answer 수신 (상대방이 answer를 보냈을 때)
            console.log(
              "[WebRTC] ========== webrtc-answer 이벤트 수신 =========="
            );
            console.log("[WebRTC] 전체 메시지:", wsMessage);
            console.log("[WebRTC] 메시지 데이터:", wsMessage.data);
            console.log("[WebRTC] 메시지 데이터 타입:", typeof wsMessage.data);

            try {
              const data = wsMessage.data as any;

              // base64 인코딩된 문자열인지 확인 및 파싱
              let parsedData = data;
              if (typeof data === "string") {
                try {
                  // base64 인코딩된 문자열인지 확인
                  let jsonString = data;
                  if (/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 20) {
                    try {
                      jsonString = atob(data);
                      console.log("[WebRTC] Answer base64 디코딩 완료");
                    } catch (base64Error) {
                      console.log(
                        "[WebRTC] Answer base64 디코딩 실패, 원본 문자열 사용"
                      );
                    }
                  }
                  parsedData = JSON.parse(jsonString);
                  console.log(
                    "[WebRTC] Answer 문자열 데이터 파싱 완료:",
                    parsedData
                  );
                } catch (e) {
                  console.error(
                    "[WebRTC] Answer 데이터 파싱 실패:",
                    e,
                    "원본 데이터:",
                    data?.substring(0, 100)
                  );
                  callbacksRef.current.onError?.(
                    "Answer 데이터 파싱에 실패했습니다."
                  );
                  break;
                }
              } else {
                console.log(
                  "[WebRTC] Answer 데이터가 이미 객체입니다:",
                  parsedData
                );
              }

              // answer가 직접 data에 있는지, 또는 data.answer에 있는지 확인
              let answerData = parsedData?.answer;

              // 만약 data.answer가 없고 data 자체가 answer 형식이면
              if (!answerData && parsedData?.type && parsedData?.sdp) {
                console.log("[WebRTC] data 자체가 answer 형식입니다.");
                answerData = parsedData;
              }

              if (!pcRef.current) {
                console.error(
                  "[WebRTC] pcRef.current가 null입니다. WebRTC가 초기화되지 않았습니다."
                );
                callbacksRef.current.onError?.(
                  "WebRTC 연결이 초기화되지 않았습니다."
                );
                break;
              }

              if (!answerData) {
                console.error("[WebRTC] answer 데이터를 찾을 수 없습니다:", {
                  parsedData,
                  hasAnswer: !!parsedData?.answer,
                  hasType: !!parsedData?.type,
                  hasSdp: !!parsedData?.sdp,
                });
                callbacksRef.current.onError?.("Answer 데이터가 없습니다.");
                break;
              }

              console.log(
                "[WebRTC] ========== Answer 수신, Remote Description 설정 =========="
              );
              console.log("[WebRTC] PC 상태:", {
                connectionState: pcRef.current.connectionState,
                signalingState: pcRef.current.signalingState,
                iceConnectionState: pcRef.current.iceConnectionState,
              });
              console.log("[WebRTC] Answer 데이터:", {
                type: answerData.type,
                sdp: answerData.sdp
                  ? `${answerData.sdp.substring(0, 50)}...`
                  : "없음",
              });

              // 원격 answer 설정
              await pcRef.current.setRemoteDescription(
                new RTCSessionDescription(answerData)
              );
              console.log(
                "[WebRTC] ========== Remote Description 설정 완료 =========="
              );
              console.log("[WebRTC] 설정 후 PC 상태:", {
                connectionState: pcRef.current.connectionState,
                signalingState: pcRef.current.signalingState,
                iceConnectionState: pcRef.current.iceConnectionState,
              });

              callbacksRef.current.onWebRTCAnswer?.(answerData);
            } catch (error) {
              console.error("[WebRTC] ========== Answer 처리 실패 ==========");
              console.error("[WebRTC] 에러:", error);
              callbacksRef.current.onError?.(
                "WebRTC 연결 설정에 실패했습니다."
              );
            }
            break;
          }
          case "webrtc-ice": {
            // ICE candidate 수신
            console.log(
              "[WebRTC] ========== webrtc-ice 이벤트 수신 =========="
            );
            console.log("[WebRTC] 메시지 데이터:", wsMessage.data);
            console.log("[WebRTC] 메시지 데이터 타입:", typeof wsMessage.data);

            try {
              const data = wsMessage.data as any;

              // base64 인코딩된 문자열인지 확인 및 파싱
              let parsedData = data;
              if (typeof data === "string") {
                try {
                  // base64 인코딩된 문자열인지 확인
                  let jsonString = data;
                  if (/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 20) {
                    try {
                      jsonString = atob(data);
                      console.log("[WebRTC] ICE base64 디코딩 완료");
                    } catch (base64Error) {
                      console.log(
                        "[WebRTC] ICE base64 디코딩 실패, 원본 문자열 사용"
                      );
                    }
                  }
                  parsedData = JSON.parse(jsonString);
                  console.log(
                    "[WebRTC] ICE 문자열 데이터 파싱 완료:",
                    parsedData
                  );
                } catch (e) {
                  console.error(
                    "[WebRTC] ICE 데이터 파싱 실패:",
                    e,
                    "원본 데이터:",
                    data?.substring(0, 100)
                  );
                  break;
                }
              } else {
                console.log(
                  "[WebRTC] ICE 데이터가 이미 객체입니다:",
                  parsedData
                );
              }

              // candidate가 직접 data에 있는지, 또는 data.candidate에 있는지 확인
              let candidateData = parsedData?.candidate;

              if (!pcRef.current) {
                console.error("[WebRTC] pcRef.current가 null입니다.");
                break;
              }

              if (!candidateData) {
                console.error(
                  "[WebRTC] ICE candidate 데이터를 찾을 수 없습니다:",
                  {
                    parsedData,
                    hasCandidate: !!parsedData?.candidate,
                  }
                );
                break;
              }

              console.log("[WebRTC] ========== ICE candidate 추가 ==========");
              console.log("[WebRTC] PC 상태:", {
                connectionState: pcRef.current.connectionState,
                signalingState: pcRef.current.signalingState,
                iceConnectionState: pcRef.current.iceConnectionState,
              });
              console.log("[WebRTC] Candidate 데이터:", candidateData);

              // 원격 ICE candidate 추가
              await pcRef.current.addIceCandidate(
                new RTCIceCandidate(candidateData)
              );
              console.log(
                "[WebRTC] ========== ICE candidate 추가 완료 =========="
              );
              console.log("[WebRTC] 추가 후 PC 상태:", {
                connectionState: pcRef.current.connectionState,
                signalingState: pcRef.current.signalingState,
                iceConnectionState: pcRef.current.iceConnectionState,
              });

              callbacksRef.current.onWebRTCIce?.(candidateData);
            } catch (error) {
              console.error(
                "[WebRTC] ========== ICE candidate 처리 실패 =========="
              );
              console.error("[WebRTC] 에러:", error);
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
