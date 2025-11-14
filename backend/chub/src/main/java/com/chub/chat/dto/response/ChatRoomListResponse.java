package com.chub.chat.dto.response;

import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class ChatRoomListResponse {

    List<ChatRoomDto> rooms;

    private ChatRoomListResponse(List<ChatRoomDto> rooms) {
        this.rooms = rooms;
    }

    public static ChatRoomListResponse from(List<ChatRoom> chatRooms, Long userId, Map<Long, User> opponents) {
        return new ChatRoomListResponse(
                chatRooms.stream()
                        .map(chatRoom -> {
                            Long opponentId = chatRoom.getParticipantIds().stream()
                                    .filter(id -> !id.equals(userId))
                                    .findFirst()
                                    .orElse(null);
                            int unreadCount = chatRoom.getParticipants().get(userId).getUnreadCount();
                            return ChatRoomDto.from(chatRoom, userId, opponents.get(opponentId), unreadCount);
                        }).toList()
        );
    }
}