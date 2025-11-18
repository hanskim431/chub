import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: "CHAT" | "SYSTEM";
}

interface FloatingChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

export function FloatingChat({
  messages,
  onSendMessage,
  isConnected,
}: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      onSendMessage(input.trim());
      setInput("");
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        title="채팅 열기"
      >
        <MessageSquare className="w-6 h-6" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold">채팅</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title={isMinimized ? "최대화" : "최소화"}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[300px] max-h-[400px]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                메시지가 없습니다.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.type === "SYSTEM" ? "items-center" : "items-start"
                  }`}
                >
                  {message.type === "SYSTEM" ? (
                    <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-[80%]">
                      <div className="text-xs text-gray-500 mb-1">
                        {message.senderName}
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-900 shadow-sm border border-gray-200">
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

          {/* 입력 영역 */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-3 bg-white rounded-b-lg"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                disabled={!isConnected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                type="submit"
                disabled={!isConnected || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                전송
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

