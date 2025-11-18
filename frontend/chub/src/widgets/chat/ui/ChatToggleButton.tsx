import { MessageSquare, X } from "lucide-react";

interface ChatToggleButtonProps {
  isOpen: boolean;
  totalUnreadCount: number;
  onToggle: () => void;
}

export function ChatToggleButton({
  isOpen,
  totalUnreadCount,
  onToggle,
}: ChatToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50"
      style={{ position: "fixed", bottom: "1rem", right: "1rem" }}
      title={isOpen ? "채팅 닫기" : "채팅 열기"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageSquare className="w-6 h-6" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}

