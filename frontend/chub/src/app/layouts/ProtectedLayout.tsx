import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/widgets/header";
import { FloatingChat } from "@/widgets/chat";
import { useMe } from "@/features/auth/api/me";
import { useChatRooms } from "@/entities/chat/api/query";
import { useChatWebSocket } from "@/widgets/chat/hooks/useChatWebSocket";
import { ChatWebSocketProvider } from "@/widgets/chat/context/ChatWebSocketContext";

function ProtectedLayout() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useMe();
    const isAuthenticated = !!(!isLoading && !error && data?.success && data?.data);
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
        enabled: isAuthenticated, // 로그인 시 바로 연결 (채팅방이 없어도 연결)
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [navigate, isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="flex h-full flex-col">
                <Header />
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

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
                <FloatingChat />
            </div>
        </ChatWebSocketProvider>
    );
}

export default ProtectedLayout;
