package com.chub.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "면접 신청 요청")
public record CreateInterviewRequestRequest(
        @Schema(description = "면접관 프로필 ID", example = "1")
        @NotNull(message = "면접관 프로필 ID는 필수입니다")
        Long interviewerId,

        @Schema(description = "신청 메시지", example = "안녕하세요. 소프트웨어 엔지니어링 면접을 준비하고 있습니다...")
        @NotBlank(message = "신청 메시지는 필수입니다")
        String requestMessage
) {
}
