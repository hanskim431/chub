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
  const { data: chatRoomsData } = useChatRooms();

  // 로그인 시 모든 채팅방 구독 (메모이제이션으로 불필요한 재생성 방지)
  const chatRoomsForSubscription = useMemo(() => {
    const chatRooms = chatRoomsData?.data?.rooms || [];
    return chatRooms.map((room) => ({
      roomId: room.roomId,
    }));
  }, [chatRoomsData?.data?.rooms]);

  const { wsConnected, sendMessage, markAsRead } = useChatWebSocket({
    currentUserId,
    chatRooms: chatRoomsForSubscription,
    enabled: isAuthenticated, // 로그인 시 바로 연결 (채팅방이 없어도 연결)
  });

  return (
    <ChatWebSocketProvider
      value={{
        wsConnected,
        sendMessage,
        markAsRead,
      }}
    >
      <div className="flex h-full flex-col">
        <Header />
        <Outlet />
        {isAuthenticated && <FloatingChat />}
      </div>
    </ChatWebSocketProvider>
  );
}

export default MainLayout;
