import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  senderId: number | null;
  senderName: string | null;
  receiverId?: number | null;
  receiverNickname?: string | null;
  content: string;
  timestamp: string;
  type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isConnected,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">채팅</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 text-sm">
              메시지가 없습니다.
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.type === "SYSTEM" || message.type === "SYSTEM_QUESTION" || message.type === "SYSTEM_ANSWER"
                  ? "items-center"
                  : "items-start"
              }`}
            >
              {message.type === "SYSTEM" || message.type === "SYSTEM_QUESTION" || message.type === "SYSTEM_ANSWER" ? (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {message.content}
                </div>
              ) : (
                <div className="max-w-[80%]">
                  {message.senderName && (
                    <div className="text-xs text-gray-500 mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-gray-900">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

