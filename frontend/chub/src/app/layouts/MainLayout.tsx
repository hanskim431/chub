import { Outlet } from "react-router-dom";
import Header from "@/widgets/header";
import { FloatingChat } from "@/widgets/chat";
import { useMe } from "@/features/auth/api/me";
import { useChatRooms } from "@/entities/chat/api/query";
import { useChatWebSocket } from "@/widgets/chat/hooks/useChatWebSocket";
import { ChatWebSocketProvider } from "@/widgets/chat/context/ChatWebSocketContext";

function MainLayout() {
  const { data } = useMe();
  const isAuthenticated = data?.success && data?.data;
  const currentUserId = data?.data?.id;
  const { data: chatRoomsData } = useChatRooms();

  // 로그인 시 모든 채팅방 구독
  const chatRooms = chatRoomsData?.data?.rooms || [];
  const chatRoomsForSubscription = chatRooms.map((room) => ({
    roomId: room.roomId,
  }));

  const { wsConnected, sendMessage, markAsRead } = useChatWebSocket({
    currentUserId,
    chatRooms: chatRoomsForSubscription,
    enabled: isAuthenticated && chatRooms.length > 0,
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
