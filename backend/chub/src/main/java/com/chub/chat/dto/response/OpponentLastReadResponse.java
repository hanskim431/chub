package com.chub.chat.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record OpponentLastReadResponse(
        String roomId,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        LocalDateTime lastReadAt
) {
    public static OpponentLastReadResponse of(String roomId, LocalDateTime lastReadAt) {
        return new OpponentLastReadResponse(roomId, lastReadAt);
    }
}
