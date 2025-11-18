import { useRef } from "react";

interface ChatInputProps {
  input: string;
  wsConnected: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({
  input,
  wsConnected,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="border-t border-gray-200 p-2 bg-white">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={wsConnected ? "메시지를 입력하세요..." : "연결 중..."}
          disabled={!wsConnected}
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-xs transition-all"
        />
        <button
          type="submit"
          disabled={!wsConnected || !input.trim()}
          className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-sm hover:shadow-md disabled:shadow-none"
        >
          전송
        </button>
      </div>
    </form>
  );
}

