package com.chub.chat.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
@Schema(description = "채팅 메시지 내역 조회 응답")
public record MessageListResponse(
        String roomId,
        List<MessageDto> message,
        Map<String, ParticipantDto> participants,
        PaginationDto pagination
) {
    public static MessageListResponse of(
            String roomId, List<MessageDto> message, Map<String, ParticipantDto> participants, PaginationDto pagination) {
        return new MessageListResponse(roomId, message, participants, pagination);
    }
}