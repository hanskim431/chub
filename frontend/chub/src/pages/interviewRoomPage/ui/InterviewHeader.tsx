import { X } from "lucide-react";

interface InterviewHeaderProps {
  timeRemaining: number;
  formattedTime: string;
  interviewStatus: "WAITING" | "READY" | "QUESTION" | "ANSWER" | "COMPLETED" | string;
  onEndInterview: () => void;
  onLeaveRoom: () => void;
  isConnected: boolean;
}

export function InterviewHeader({
  formattedTime,
  interviewStatus,
  onEndInterview,
  onLeaveRoom,
  isConnected,
}: InterviewHeaderProps) {
  const getStatusText = () => {
    switch (interviewStatus) {
      case "WAITING":
        return "대기 중";
      case "READY":
        return "준비 완료";
      case "QUESTION":
        return "질문 중";
      case "ANSWER":
        return "답변 중";
      case "COMPLETED":
        return "면접 완료";
      default:
        return interviewStatus || "";
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "연결됨" : "연결 중..."}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          상태: <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>방 나가기</span>
        </button>
        <button
          onClick={onEndInterview}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>면접 종료하기</span>
        </button>
      </div>
    </div>
  );
}

