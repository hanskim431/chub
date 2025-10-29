package com.chub.dto.response;

import com.chub.entity.InterviewRequest;
import com.chub.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "받은 면접 신청 응답")
public record ReceivedInterviewRequestResponse(
        @Schema(description = "신청 ID", example = "1")
        Long id,

        @Schema(description = "면접 신청자 정보")
        IntervieweeInfo interviewee,

        @Schema(description = "신청 상태", example = "PENDING")
        String status,

        @Schema(description = "신청 메시지", example = "안녕하세요...")
        String requestMessage,

        @Schema(description = "생성일시")
        LocalDateTime createdAt
) {
    @Schema(description = "면접 신청자 정보")
    public record IntervieweeInfo(
            @Schema(description = "사용자 ID", example = "1")
            Long id,

            @Schema(description = "이름", example = "이지원")
            String name,

            @Schema(description = "프로필 이미지 URL")
            String avatar
    ) {
        public static IntervieweeInfo from(User user) {
            return new IntervieweeInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getAvatarUrl()
            );
        }
    }

    public static ReceivedInterviewRequestResponse from(InterviewRequest request) {
        User interviewee = request.getUser();

        return new ReceivedInterviewRequestResponse(
                request.getId(),
                IntervieweeInfo.from(interviewee),
                request.getStatus(),
                request.getMessage(),
                request.getCreatedAt()
        );
    }
}
