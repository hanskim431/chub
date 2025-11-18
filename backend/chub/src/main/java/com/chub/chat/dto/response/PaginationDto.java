package com.chub.chat.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record PaginationDto(
        int pageSize,
        boolean hasNext,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        LocalDateTime nextCursor
) {
    public static PaginationDto of(int pageSize, boolean hasNext, LocalDateTime nextCursor) {
        return new PaginationDto(pageSize, hasNext, nextCursor);
    }
}

