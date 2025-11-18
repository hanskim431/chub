import { useEffect, useRef, useState } from "react";
import { Client, type Message as StompMessage } from "@stomp/stompjs";
// @ts-ignore - sockjs-client 타입 정의 없음
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";

interface UseChatWebSocketProps {
  currentUserId: number | undefined;
  chatRooms: Array<{ roomId: string }>;
  enabled?: boolean;
}

export function useChatWebSocket({
  currentUserId,
  chatRooms,
  enabled = true,
}: UseChatWebSocketProps) {
  const queryClient = useQueryClient();
  const stompClientRef = useRef<Client | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // 웹소켓 연결 (한 번만 연결)
  useEffect(() => {
    if (!currentUserId || !enabled) return;
    if (stompClientRef.current) return; // 이미 연결되어 있으면 스킵

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const socket = new SockJS(`${apiUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
      },
      onStompError: () => {
        setWsConnected(false);
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [currentUserId, enabled]);

  // 채팅방 구독 (연결 후 채팅방 목록이 변경될 때만)
  useEffect(() => {
    if (!wsConnected || !stompClientRef.current?.connected || !currentUserId)
      return;

    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    // 모든 채팅방에 대한 메시지 수신 구독
    if (chatRooms.length > 0) {
      chatRooms.forEach((room) => {
        // roomId에 특수 문자(:)가 포함되어 있으므로 URL 인코딩
        const encodedRoomId = encodeURIComponent(room.roomId);
        const subscription = stompClientRef.current!.subscribe(
          `/topic/chat/rooms/${encodedRoomId}`,
          (message: StompMessage) => {
            const data = JSON.parse(message.body);
            if (data.type === "message.received") {
              // 새 메시지 수신 시 메시지 목록 갱신
              queryClient.invalidateQueries({
                queryKey: ["chatMessages", room.roomId],
              });
              // 채팅방 목록도 갱신
              queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
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
        subscriptions.push(subscription);
      });
    }

    // 개인 큐 구독 (토스트 알림용)
    const userQueueSubscription = stompClientRef.current.subscribe(
      `/user/${currentUserId}/queue/messages`,
      (message: StompMessage) => {
        const data = JSON.parse(message.body);
        if (data.type === "message.received") {
          // 토스트 알림 표시 (선택사항)
        }
      }
    );
    subscriptions.push(userQueueSubscription);

    return () => {
      // 구독 해제
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [wsConnected, currentUserId, chatRooms, queryClient]);

  // 메시지 전송
  const sendMessage = (roomId: string, content: string) => {
    if (!stompClientRef.current?.connected) return false;

    stompClientRef.current.publish({
      destination: "/chat/send",
      body: JSON.stringify({
        roomId,
        content,
      }),
    });
    return true;
  };

  // 읽음 처리 전송
  const markAsRead = (roomId: string) => {
    if (!stompClientRef.current?.connected) return false;

    stompClientRef.current.publish({
      destination: "/chat/mark-read",
      body: JSON.stringify({ roomId }),
    });
    return true;
  };

  return {
    wsConnected,
    sendMessage,
    markAsRead,
  };
}
