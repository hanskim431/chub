import { MessageSquare } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-linear-to-b from-gray-50 to-white">
      <div className="text-center text-gray-400">
        <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">대화를 선택하세요</p>
      </div>
    </div>
  );
}
