package com.chub.chat.dto.response;

import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class ChatRoomDto {
    private String roomId;
    private ParticipantDto opponent;
    private LastMessageDto lastMessage;
    private int unreadCount;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime updatedAt;


    @Builder
    @Getter
    public static class LastMessageDto {
        private String content;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        private LocalDateTime timestamp;
    }

    static ChatRoomDto from(ChatRoom chatRoom, Long userId, User opponent, int unreadCount) {
        return ChatRoomDto.builder()
                .roomId(chatRoom.getRoomId())
                .opponent(mapOpponentDto(opponent))
                .lastMessage(mapLastMessageDto(chatRoom))
                .unreadCount(unreadCount)
                .updatedAt(chatRoom.getUpdatedAt())
                .build();
    }

    private static ParticipantDto mapOpponentDto(User opponent) {
        return ParticipantDto.builder()
                .id(opponent.getId())
                .name(opponent.getUsername())
                .avatar(opponent.getAvatarUrl())
                .build();
    }


    private static LastMessageDto mapLastMessageDto(ChatRoom chatRoom) {
        return LastMessageDto.builder()
                .content(chatRoom.getLastMessage())
                .timestamp(chatRoom.getUpdatedAt())
                .build();
    }

    @Deprecated
    private static int countUnreadCount(ChatRoom chatRoom, Long userId) {
        ChatRoom.ParticipantInfo participantInfo = chatRoom.getParticipants().get(userId);
        return participantInfo != null && participantInfo.getUnreadCount() != null ?
                participantInfo.getUnreadCount() : 0;
    }
}
