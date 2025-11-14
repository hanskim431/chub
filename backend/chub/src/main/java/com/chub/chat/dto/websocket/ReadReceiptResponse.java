package com.chub.chat.dto.websocket;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ReadReceiptResponse(

        Long readerId,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        LocalDateTime lastReadAt
) {
    public static ReadReceiptResponse of(Long readerId, LocalDateTime localDateTime) {
        return new ReadReceiptResponse(readerId, localDateTime);
    }
}
