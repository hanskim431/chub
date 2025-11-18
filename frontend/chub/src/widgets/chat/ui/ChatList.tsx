import { MessageSquare } from "lucide-react";
import type { Conversation } from "@/widgets/chat/ui/types";
import { formatLastMessageTime } from "@/widgets/chat/ui/utils";

interface ChatListProps {
  conversations: Conversation[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatList({
  conversations,
  selectedRoomId,
  onSelectRoom,
}: ChatListProps) {
  return (
    <div className="w-40 border-r border-gray-200 flex flex-col bg-gray-50">
      <div className="px-3 py-2 bg-linear-to-r from-blue-600 via-blue-600 to-blue-700 text-white shadow-md">
        <h3 className="font-bold text-sm">채팅</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-12 px-4">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>대화가 없습니다.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.roomId}
              onClick={() => onSelectRoom(conversation.roomId)}
              className={`w-full px-2 py-2 text-left hover:bg-gray-100 transition-all duration-150 border-b border-gray-100 ${
                selectedRoomId === conversation.roomId
                  ? "bg-white border-l-4 border-l-blue-600 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {/* 프로필 사진 */}
                {conversation.userAvatar ? (
                  <img
                    src={conversation.userAvatar}
                    alt={conversation.userName}
                    className="w-10 h-10 rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      {conversation.userName.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        selectedRoomId === conversation.roomId
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {conversation.userName}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-1 shadow-sm">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <>
                      <p className="text-xs text-gray-600 truncate mb-0.5 leading-tight">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatLastMessageTime(conversation.lastMessageTime)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

