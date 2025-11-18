import { createContext, useContext, type ReactNode } from "react";

interface ChatWebSocketContextValue {
  wsConnected: boolean;
  sendMessage: (roomId: string, content: string) => boolean;
  markAsRead: (roomId: string) => boolean;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextValue | null>(
  null
);

export function ChatWebSocketProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ChatWebSocketContextValue;
}) {
  return (
    <ChatWebSocketContext.Provider value={value}>
      {children}
    </ChatWebSocketContext.Provider>
  );
}

export function useChatWebSocketContext() {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error(
      "useChatWebSocketContext must be used within ChatWebSocketProvider"
    );
  }
  return context;
}

