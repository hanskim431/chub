import { X } from "lucide-react";

interface ChatHeaderProps {
  userName: string;
  onClose: () => void;
}

export function ChatHeader({ userName, onClose }: ChatHeaderProps) {
  return (
    <div className="px-3 py-2 bg-linear-to-r from-blue-600 via-blue-600 to-blue-700 text-white shadow-md flex items-center justify-between flex-shrink-0">
      <h3 className="font-bold text-sm">{userName}</h3>
      <button
        onClick={onClose}
        className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
        title="채팅 닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

