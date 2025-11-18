import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChatRoom,
  getChatRooms,
  getChatMessages,
  getOpponentLastRead,
} from "./requests";
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

export const useChatRooms = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => getChatRooms(),
    enabled: options?.enabled !== false, // 기본값은 true
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
    refetchOnMount: true, // 채팅방을 열 때마다 메시지 목록 다시 요청
    staleTime: 0, // 캐시를 사용하지 않고 항상 최신 데이터 요청
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
    refetchOnMount: true, // 채팅방을 열 때마다 상대방 마지막 읽은 시간 다시 요청
    staleTime: 0, // 캐시를 사용하지 않고 항상 최신 데이터 요청
  });
};
