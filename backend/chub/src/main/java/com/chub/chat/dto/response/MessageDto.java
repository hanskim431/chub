package com.chub.chat.dto.response;

import com.chub.entity.Message;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record MessageDto(
        String id,
        String senderId,
        String content,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        LocalDateTime createdAt
) {
    public static MessageDto from(Message message) {
        return new MessageDto(
                String.valueOf(message.getId()),
                String.valueOf(message.getMessageFrom()),
                message.getContent(),
                message.getCreatedAt());
    }
}