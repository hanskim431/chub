package com.chub.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "면접 신청 상태 변경 요청")
public record UpdateRequestStatusRequest(
        @Schema(description = "수락 여부 (true: 수락, false: 거절)", example = "true")
        @NotNull(message = "수락 여부는 필수입니다")
        Boolean accepted
) {
}
