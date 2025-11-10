package com.chub.chat.dto.response;

import java.time.LocalDateTime;

public record PaginationDto(
        int pageSize,
        boolean hasNext,
        LocalDateTime nextCursor
) {
    public static PaginationDto of(int pageSize, boolean hasNext, LocalDateTime nextCursor) {
        return new PaginationDto(pageSize, hasNext, nextCursor);
    }
}

