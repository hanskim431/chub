import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/widgets/header";
import { FloatingChat } from "@/widgets/chat";
import { useMe } from "@/features/auth/api/me";

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

function MainLayout() {
    const { data, isLoading, error } = useMe();
    const isAuthenticated = !isLoading && !error && data?.success && data?.data;

    const handleSendMessage = (message: string, recipientId: number) => {
        // TODO: WebSocket을 통해 실제 메시지 전송
        console.log("메시지 전송:", message, "받는 사람:", recipientId);
    };

    return (
        <div className="flex h-full flex-col">
            <Header />
            <Outlet />
            {isAuthenticated && (
                <FloatingChat
                    messages={mockMessages}
                    onSendMessage={handleSendMessage}
                    isConnected={true}
                />
            )}
        </div>
    );
}

export default MainLayout;
