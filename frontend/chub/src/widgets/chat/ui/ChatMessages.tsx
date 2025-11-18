import { MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/entities/chat/model/types";
import { ChatMessageItem } from "@/widgets/chat/ui/ChatMessageItem";

interface ChatMessagesProps {
  messages: Array<ChatMessage & { isUnread: boolean; senderName: string }>;
  isLoading: boolean;
  error: Error | null;
  unreadIndex: number;
  currentUserId: number | undefined;
  userAvatar?: string;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  unreadDividerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isLoading,
  error,
  unreadIndex,
  currentUserId,
  userAvatar,
  messagesContainerRef,
  unreadDividerRef,
  messagesEndRef,
}: ChatMessagesProps) {
  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-sm py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30 animate-pulse" />
        <p>메시지를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 text-sm py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>메시지를 불러오는데 실패했습니다.</p>
        <p className="text-xs mt-2">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>메시지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-3 space-y-4 bg-linear-to-b from-gray-50 to-white"
    >
      {messages.map((message, index) => {
        const isMyMessage =
          currentUserId && message.senderId === String(currentUserId);
        const showUnreadDivider = unreadIndex >= 0 && index === unreadIndex;

        return (
          <ChatMessageItem
            key={message.id}
            message={message}
            isMyMessage={!!isMyMessage}
            showUnreadDivider={showUnreadDivider}
            userAvatar={userAvatar}
            unreadDividerRef={showUnreadDivider ? unreadDividerRef : undefined}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

