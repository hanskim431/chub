package com.chub.dto.response;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "면접 신청 응답")
public record InterviewRequestResponse(
        @Schema(description = "신청 ID", example = "1")
        Long id,

        @Schema(description = "면접관 정보")
        InterviewerInfo interviewer,

        @Schema(description = "신청 상태", example = "PENDING")
        String status,

        @Schema(description = "신청 메시지", example = "안녕하세요...")
        String requestMessage,

        @Schema(description = "생성일시")
        LocalDateTime createdAt
) {
    @Schema(description = "면접관 정보")
    public record InterviewerInfo(
            @Schema(description = "면접관 프로필 ID", example = "1")
            Long id,

            @Schema(description = "이름", example = "김민준")
            String name,

            @Schema(description = "프로필 이미지 URL")
            String avatar,

            @Schema(description = "전문 분야", example = "소프트웨어 엔지니어링")
            String field
    ) {
        public static InterviewerInfo from(InterviewerProfile profile, User user) {
            return new InterviewerInfo(
                    profile.getId(),
                    user.getUsername(),
                    user.getAvatarUrl(),
                    profile.getField()
            );
        }
    }

    public static InterviewRequestResponse from(InterviewRequest request) {
        InterviewerProfile profile = request.getInterviewerProfile();
        User interviewer = profile.getUser();

        return new InterviewRequestResponse(
                request.getId(),
                InterviewerInfo.from(profile, interviewer),
                request.getStatus(),
                request.getMessage(),
                request.getCreatedAt()
        );
    }
}
