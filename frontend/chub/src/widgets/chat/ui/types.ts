export interface Message {
  id: string;
  senderId: number;
  senderName: string;
  recipientId?: number;
  content: string;
  timestamp: string;
  type: "CHAT" | "SYSTEM";
}

export interface Conversation {
  roomId: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface FloatingChatProps {
  messages?: Message[];
  onSendMessage?: (message: string, recipientId: number) => void;
  isConnected?: boolean;
}
