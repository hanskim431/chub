import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import Header from "@/widgets/header";
import { FloatingChat } from "@/widgets/chat";
import { useMe } from "@/features/auth/api/me";
import { useChatRooms } from "@/entities/chat/api/query";
import { useChatWebSocket } from "@/widgets/chat/hooks/useChatWebSocket";
import { ChatWebSocketProvider } from "@/widgets/chat/context/ChatWebSocketContext";

function MainLayout() {
  const { data } = useMe();
  const isAuthenticated = !!(data?.success && data?.data);
  const currentUserId = data?.data?.id;

  // 인증된 경우에만 채팅 관련 훅 호출
  const { data: chatRoomsData } = useChatRooms({
    enabled: isAuthenticated,
  });

  // 로그인 시 모든 채팅방 구독 (메모이제이션으로 불필요한 재생성 방지)
  const chatRoomsForSubscription = useMemo(() => {
    if (!chatRoomsData?.success || !chatRoomsData?.data?.rooms) {
      return [];
    }
    const chatRooms = chatRoomsData.data.rooms;
    return chatRooms.map((room) => ({
      roomId: room.roomId,
    }));
  }, [chatRoomsData]);

  // 일반 채팅 WebSocket 구독
  const { wsConnected, sendMessage, markAsRead, setOnMessageReceived } =
    useChatWebSocket({
      currentUserId,
      chatRooms: chatRoomsForSubscription,
      enabled: isAuthenticated, // 구독 활성화 여부
    });

  const content = (
    <div className="flex h-full flex-col">
      <Header />
      <Outlet />
      {isAuthenticated && <FloatingChat />}
    </div>
  );

  // 로그인한 경우에만 ChatWebSocketProvider로 감싸기
  if (isAuthenticated) {
    return (
      <ChatWebSocketProvider
        value={{
          wsConnected,
          sendMessage,
          markAsRead,
          setOnMessageReceived,
        }}
      >
        {content}
      </ChatWebSocketProvider>
    );
  }

  return content;
}

export default MainLayout;
