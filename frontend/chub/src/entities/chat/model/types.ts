export interface CreateChatRoomRequest {
  opponentId: number;
}

export interface CreateChatRoomResponse {
  roomId: string;
}

export interface ChatRoomOpponent {
  id: number;
  name: string;
  avatar: string;
}

export interface ChatRoomLastMessage {
  content: string;
  timestamp: string;
}

export interface ChatRoom {
  roomId: string;
  opponent: ChatRoomOpponent;
  lastMessage: ChatRoomLastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface GetChatRoomsResponse {
  rooms: ChatRoom[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatParticipant {
  id: number;
  name: string;
  avatar: string;
}

export interface ChatMessagesPagination {
  pageSize: number;
  hasNext: boolean;
  nextCursor?: string;
}

export interface GetChatMessagesResponse {
  roomId: string;
  message: ChatMessage[];
  participants: Record<string, ChatParticipant>;
  pagination: ChatMessagesPagination;
}

export interface OpponentLastReadResponse {
  lastReadAt: string | null;
}

