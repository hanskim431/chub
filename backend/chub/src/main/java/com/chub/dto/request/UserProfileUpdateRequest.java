package com.chub.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;

@Schema(description = "사용자 프로필 수정 요청 (모든 필드 선택적)")
public record UserProfileUpdateRequest(
        @Schema(description = "사용자 이름", example = "홍길동")
        String username,

        @Schema(description = "이메일", example = "hong@example.com")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        String email,

        @Schema(description = "한줄 소개", example = "백엔드 개발자입니다")
        String bio
) {
}
