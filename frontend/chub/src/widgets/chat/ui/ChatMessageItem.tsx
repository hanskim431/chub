import type { ChatMessage } from "@/entities/chat/model/types";
import { formatTime } from "@/widgets/chat/ui/utils";

interface ChatMessageItemProps {
  message: ChatMessage & { isUnread: boolean; senderName: string };
  isMyMessage: boolean;
  showUnreadDivider: boolean;
  userAvatar?: string;
  currentUserId: number | undefined;
  unreadDividerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageItem({
  message,
  isMyMessage,
  showUnreadDivider,
  userAvatar,
  currentUserId,
  unreadDividerRef,
}: ChatMessageItemProps) {
  const isUnread = message.isUnread;

  return (
    <div>
      {showUnreadDivider && (
        <div ref={unreadDividerRef} className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-500 font-medium bg-gray-50 rounded-full">
            안읽은 메시지
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
      )}
      <div
        className={`flex w-full gap-2 ${
          isMyMessage ? "justify-end" : "justify-start"
        }`}
      >
        {/* 상대 메시지: 왼쪽에 프로필 사진 */}
        {!isMyMessage && (
          <>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={message.senderName}
                className="w-8 h-8 rounded-full shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {message.senderName.charAt(0)}
                </span>
              </div>
            )}
          </>
        )}

        <div
          className={`flex flex-col ${
            isMyMessage ? "items-end" : "items-start"
          } max-w-[75%]`}
        >
          {/* 상대 메시지: 보낸 사람 이름 (내 메시지는 이름 없음) */}
          {!isMyMessage && (
            <div className="text-xs text-gray-600 mb-1 font-medium px-1">
              {message.senderName}
            </div>
          )}

          {/* 메시지 버블과 시간/읽음 표시 */}
          <div className="flex items-end gap-1">
            {/* 내 메시지: 읽음 표시와 시간이 왼쪽에 */}
            {isMyMessage && (
              <div className="flex flex-col items-end gap-0.5">
                {/* 안읽은 메시지에만 "1" 표시 (읽은 메시지는 표시 없음) */}
                {isUnread && (
                  <span className="bg-[#ee7900] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    1
                  </span>
                )}
                {/* 시간 표시 */}
                <span className="text-xs text-gray-400">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            )}

            {/* 메시지 버블 */}
            <div
              className={`rounded-2xl px-3 py-1.5 text-sm shadow-sm ${
                isMyMessage
                  ? "bg-[#ee7900] text-white rounded-br-sm text-right"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm text-left"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            </div>

            {/* 상대 메시지: 시간이 오른쪽에 (읽음 표시 없음) */}
            {!isMyMessage && (
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs text-gray-400">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

