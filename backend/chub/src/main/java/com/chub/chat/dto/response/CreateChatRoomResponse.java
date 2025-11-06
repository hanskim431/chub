package com.chub.chat.dto.response;

import com.chub.entity.ChatRoom;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "일반 채팅방 ID 조회 응답")
public record CreateChatRoomResponse(
        @Schema(description = "일반 채팅방 ID")
        String roomId
) {
    public static CreateChatRoomResponse from(ChatRoom chatRoom){
        return new CreateChatRoomResponse(chatRoom.getRoomId());
    }

}
