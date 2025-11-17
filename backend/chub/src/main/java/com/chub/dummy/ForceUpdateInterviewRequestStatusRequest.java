package com.chub.dummy;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "면접 요청 상태 강제 변경 요청 (개발용)")
public record ForceUpdateInterviewRequestStatusRequest(
        @Schema(
                description = """
                        면접 요청 상태
                        - PENDING: 대기중 (신청 직후 기본 상태)
                        - APPROVED: 승인됨 (면접관이 승인)
                        - REJECTED: 거절됨 (면접관이 거절)
                        - CANCELLED: 취소됨 (신청자가 취소)
                        - COMPLETED: 완료됨 (면접 완료)
                        """,
                example = "APPROVED",
                allowableValues = {"PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"}
        )
        @NotBlank(message = "상태는 필수입니다")
        @Pattern(
                regexp = "^(PENDING|APPROVED|REJECTED|CANCELLED|COMPLETED)$",
                message = "유효하지 않은 상태입니다. PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED 중 하나여야 합니다"
        )
        String status
) {
}
