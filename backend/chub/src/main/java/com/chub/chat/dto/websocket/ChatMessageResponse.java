package com.chub.chat.dto.websocket;

import com.chub.entity.Message;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "메시지 전송 확인 및 수신")
public record ChatMessageResponse(
        String roomId,
        String id,
        Long senderId,
        String content,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        LocalDateTime createdAt
) {
    public static ChatMessageResponse from(Message message) {
        return new ChatMessageResponse(
                message.getRoomId(),
                String.valueOf(message.getId()),
                message.getMessageFrom(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}