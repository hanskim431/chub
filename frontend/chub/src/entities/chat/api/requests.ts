import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/entities/interviewer/model/types";
import type {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  GetChatRoomsResponse,
  GetChatMessagesResponse,
  OpponentLastReadResponse,
} from "../model/types";

export const createChatRoom = async (
  data: CreateChatRoomRequest
): Promise<ApiResponse<CreateChatRoomResponse>> => {
  const response = await api.post<ApiResponse<CreateChatRoomResponse>>(
    "/api/chat/rooms/create",
    data
  );
  return response.data;
};

export const getChatRooms = async (): Promise<ApiResponse<GetChatRoomsResponse>> => {
  const response = await api.get<ApiResponse<GetChatRoomsResponse>>("/api/chat/rooms");
  return response.data;
};

export const getChatMessages = async (
  roomId: string,
  cursor?: string
): Promise<ApiResponse<GetChatMessagesResponse>> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<ApiResponse<GetChatMessagesResponse>>(
    `/api/chat/rooms/${roomId}/messages`,
    { params }
  );
  return response.data;
};

export const getOpponentLastRead = async (
  roomId: string
): Promise<ApiResponse<OpponentLastReadResponse>> => {
  const response = await api.get<ApiResponse<OpponentLastReadResponse>>(
    `/api/chat/rooms/${roomId}/messages/opponent-last-read`
  );
  return response.data;
};

