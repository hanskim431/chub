import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createChatRoom, getChatRooms, getChatMessages, getOpponentLastRead } from "./requests";
import type { CreateChatRoomRequest } from "../model/types";

export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChatRoomRequest) => createChatRoom(data),
    onSuccess: () => {
      // 채팅방 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });
};

export const useChatRooms = () => {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => getChatRooms(),
  });
};

export const useChatMessages = (roomId: string | null, cursor?: string) => {
  return useQuery({
    queryKey: ["chatMessages", roomId, cursor],
    queryFn: () => {
      if (!roomId) throw new Error("roomId is required");
      return getChatMessages(roomId, cursor);
    },
    enabled: !!roomId,
  });
};

export const useOpponentLastRead = (roomId: string | null) => {
  return useQuery({
    queryKey: ["opponentLastRead", roomId],
    queryFn: () => {
      if (!roomId) throw new Error("roomId is required");
      return getOpponentLastRead(roomId);
    },
    enabled: !!roomId,
  });
};

