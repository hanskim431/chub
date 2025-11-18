import { useEffect, useRef, useState } from "react";
import { Client, type Message as StompMessage } from "@stomp/stompjs";
// @ts-ignore - sockjs-client 타입 정의 없음
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";

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
  const stompClientRef = useRef<Client | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const onMessageReceivedRef = useRef<((roomId: string) => void) | null>(null);

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
        console.log("[useChatWebSocket] WebSocket 연결됨");
        setWsConnected(true);
      },
      onStompError: (frame) => {
        console.error("[useChatWebSocket] STOMP 에러:", frame);
        setWsConnected(false);
      },
      onDisconnect: () => {
        console.log("[useChatWebSocket] WebSocket 연결 해제됨");
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
        const subscription = stompClientRef.current!.subscribe(
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
              // 메시지 수신 콜백 호출 (현재 열려있는 채팅방이면 자동 읽음 처리용)
              if (onMessageReceived) {
                onMessageReceived(room.roomId);
              }
              // Context를 통해 등록된 콜백 호출
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
  }, [wsConnected, currentUserId, chatRooms, queryClient, onMessageReceived]);

  // 메시지 전송
  const sendMessage = (roomId: string, content: string) => {
    console.log("[useChatWebSocket] sendMessage 호출:", { roomId, content });
    console.log("[useChatWebSocket] WebSocket 연결 상태:", {
      connected: stompClientRef.current?.connected,
      wsConnected,
    });

    if (!stompClientRef.current?.connected) {
      console.error("[useChatWebSocket] WebSocket이 연결되지 않았습니다.");
      return false;
    }

    try {
      stompClientRef.current.publish({
        destination: "/app/chat/send",
        body: JSON.stringify({
          roomId,
          content,
        }),
      });
      console.log("[useChatWebSocket] 메시지 전송 성공:", { roomId, content });
      return true;
    } catch (error) {
      console.error("[useChatWebSocket] 메시지 전송 실패:", error);
      return false;
    }
  };

  // 읽음 처리 전송
  const markAsRead = (roomId: string) => {
    if (!stompClientRef.current?.connected) return false;

    stompClientRef.current.publish({
      destination: "/app/chat/mark-read",
      body: JSON.stringify({ roomId }),
    });
    return true;
  };

  // 콜백 등록 함수
  const setOnMessageReceived = (
    callback: ((roomId: string) => void) | null
  ) => {
    onMessageReceivedRef.current = callback;
  };

  return {
    wsConnected,
    sendMessage,
    markAsRead,
    setOnMessageReceived,
  };
}
