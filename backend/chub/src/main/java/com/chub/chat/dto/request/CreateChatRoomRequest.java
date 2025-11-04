package com.chub.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRoomRequest {
    @NotNull(message = "상대방 ID는 필수입니다")
    @Positive(message = "상대방 ID는 양수여야 합니다")
    private Long opponentId;

}
