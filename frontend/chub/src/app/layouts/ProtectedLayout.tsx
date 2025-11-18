import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/widgets/header";
import { FloatingChat } from "@/widgets/chat";
import { useMe } from "@/features/auth/api/me";
import { useChatRooms } from "@/entities/chat/api/query";
import { useChatWebSocket } from "@/widgets/chat/hooks/useChatWebSocket";
import { ChatWebSocketProvider } from "@/widgets/chat/context/ChatWebSocketContext";

// 목업 메시지 데이터
const mockMessages = [
    {
        id: "1",
        senderId: 1,
        senderName: "강진구",
        recipientId: 0,
        content: "안녕하세요! 면접 관련해서 문의드립니다.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: "CHAT" as const,
    },
    {
        id: "2",
        senderId: 0,
        senderName: "나",
        recipientId: 1,
        content: "네, 무엇을 도와드릴까요?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        type: "CHAT" as const,
    },
    {
        id: "3",
        senderId: 1,
        senderName: "강진구",
        recipientId: 0,
        content: "면접 일정 조정이 가능한가요?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: "CHAT" as const,
    },
    {
        id: "4",
        senderId: 2,
        senderName: "배수헌",
        recipientId: 0,
        content: "면접 준비 잘 되고 있나요?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: "CHAT" as const,
    },
    {
        id: "5",
        senderId: 0,
        senderName: "나",
        recipientId: 2,
        content: "네, 열심히 준비하고 있습니다!",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        type: "CHAT" as const,
    },
];

function ProtectedLayout() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useMe();
    const isAuthenticated = !isLoading && !error && data?.success && data?.data;
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

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [navigate, isAuthenticated, isLoading]);

    const handleSendMessage = (message: string, recipientId: number) => {
        // TODO: WebSocket을 통해 실제 메시지 전송
        console.log("메시지 전송:", message, "받는 사람:", recipientId);
    };

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
                <FloatingChat
                    messages={mockMessages}
                    onSendMessage={handleSendMessage}
                    isConnected={true}
                />
            </div>
        </ChatWebSocketProvider>
    );
}

export default ProtectedLayout;
