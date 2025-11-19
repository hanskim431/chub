import { useEffect, useRef, useCallback } from "react";
import type { Message as StompMessage } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/shared/websocket/useWebSocket";

interface UseChatWebSocketProps {
  currentUserId: number | undefined;
  chatRooms: Array<{ roomId: string }>;
  enabled?: boolean;
  onMessageReceived?: (roomId: string) => void; // 메시지 수신 시 콜백
}

export function useChatWebSocket({
  currentUserId,
  chatRooms,
  enabled = true,
  onMessageReceived,
}: UseChatWebSocketProps) {
  const queryClient = useQueryClient();
  const { isConnected, subscribe, unsubscribe, publish } = useWebSocket({
    enabled: enabled && !!currentUserId,
  });
  const onMessageReceivedRef = useRef<((roomId: string) => void) | null>(null);
  // 이미 구독한 채팅방 목록 추적 (중복 구독 방지)
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const userQueueSubscribedRef = useRef<boolean>(false);

  // 콜백 ref 업데이트
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived || null;
  }, [onMessageReceived]);

  // 채팅방 구독 (연결 후 한 번만, 새로운 채팅방만 추가 구독)
  useEffect(() => {
    if (!isConnected || !currentUserId || !enabled) return;

    // 개인 큐 구독 (한 번만)
    if (!userQueueSubscribedRef.current) {
      subscribe(`/user/queue/chat`, (message: StompMessage) => {
        const data = JSON.parse(message.body);
        if (data.type === "message.received") {
          // 토스트 알림 표시 (선택사항)
        }
      });
      userQueueSubscribedRef.current = true;
    }

    // 새로운 채팅방만 구독 (이미 구독한 채팅방은 스킵)
    if (chatRooms.length > 0) {
      chatRooms.forEach((room) => {
        // 이미 구독한 채팅방은 스킵
        if (subscribedRoomsRef.current.has(room.roomId)) {
          return;
        }

        // 새 채팅방 구독
        subscribe(
          `/topic/chat/rooms/${room.roomId}`,
          (message: StompMessage) => {
            const data = JSON.parse(message.body);
            if (data.type === "message.received") {
              // 새 메시지 수신 시 메시지 목록 갱신
              queryClient.invalidateQueries({
                queryKey: ["chatMessages", room.roomId],
              });
              // 채팅방 목록 쿼리 stale 상태 초기화 및 즉시 refetch
              queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
              queryClient.refetchQueries({ queryKey: ["chatRooms"] });
              // 메시지 수신 콜백 호출
              if (onMessageReceivedRef.current) {
                onMessageReceivedRef.current(room.roomId);
              }
            } else if (data.type === "read.receipt") {
              // 읽음 처리 이벤트 수신 시 상대방 마지막 읽은 시간 갱신
              if (data.data.readerId !== currentUserId) {
                queryClient.invalidateQueries({
                  queryKey: ["opponentLastRead", room.roomId],
                });
              }
            }
          }
        );
        // 구독한 채팅방 목록에 추가
        subscribedRoomsRef.current.add(room.roomId);
      });
    }

    // cleanup: 구독 해제
    return () => {
      chatRooms.forEach((room) => {
        unsubscribe(`/topic/chat/rooms/${room.roomId}`);
        subscribedRoomsRef.current.delete(room.roomId);
      });
    };
  }, [
    isConnected,
    currentUserId,
    chatRooms,
    queryClient,
    enabled,
    subscribe,
    unsubscribe,
  ]);

  // 메시지 전송
  const sendMessage = useCallback(
    (roomId: string, content: string) => {
      if (!isConnected) {
        console.error("[Chat] WebSocket이 연결되지 않았습니다.");
        return false;
      }

      const success = publish(
        "/app/chat/send",
        JSON.stringify({
          roomId,
          content,
        })
      );

      if (success) {
        console.log("[Chat] 메시지 전송 성공:", { roomId, content });
      } else {
        console.error("[Chat] 메시지 전송 실패");
      }

      return success;
    },
    [isConnected, publish]
  );

  // 읽음 처리 전송
  const markAsRead = useCallback(
    (roomId: string) => {
      return publish("/app/chat/mark-read", JSON.stringify({ roomId }));
    },
    [publish]
  );

  // 콜백 등록 함수
  const setOnMessageReceived = useCallback(
    (callback: ((roomId: string) => void) | null) => {
      onMessageReceivedRef.current = callback;
    },
    []
  );

  return {
    wsConnected: isConnected,
    sendMessage,
    markAsRead,
    setOnMessageReceived,
  };
}

