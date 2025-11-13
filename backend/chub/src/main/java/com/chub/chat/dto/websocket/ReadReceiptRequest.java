package com.chub.chat.dto.websocket;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "채팅 읽음 요청")
public record ReadReceiptRequest(

        @Schema(description = "채팅방 ID", example = "1:2")
        @NotNull(message = "채팅방 ID는 필수입니다")
        String roomId

) {
}
