package com.chub.dto.response;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "예정된 면접 응답")
public record ScheduledInterviewResponse(
        @Schema(description = "신청 ID", example = "1")
        Long id,

        @Schema(description = "신청 메시지", example = "히히면접")
        String requestMessage,

        @Schema(description = "상대방 정보")
        OpponentInfo opponent,

        @Schema(description = "내 역할", example = "interviewer")
        String role,

        @Schema(description = "예정 일시")
        LocalDateTime scheduledAt,

        @Schema(description = "상태", example = "scheduled")
        String status,

        @Schema(description = "방 ID", example = "room_1")
        String roomId
) {
    @Schema(description = "상대방 정보")
    public record OpponentInfo(
            @Schema(description = "사용자 ID", example = "1")
            Long id,

            @Schema(description = "이름", example = "김민준")
            String name,

            @Schema(description = "프로필 이미지 URL")
            String avatar
    ) {
        public static OpponentInfo from(User user) {
            return new OpponentInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getAvatarUrl()
            );
        }
    }

    public static ScheduledInterviewResponse from(InterviewRequest request, Long currentUserId) {
        InterviewerProfile profile = request.getInterviewerProfile();
        User interviewer = profile.getUser();
        User interviewee = request.getUser();

        // 현재 사용자가 면접관인지 면접대상자인지 판별
        boolean isInterviewer = interviewer.getId().equals(currentUserId);
        User opponent = isInterviewer ? interviewee : interviewer;
        String role = isInterviewer ? "interviewer" : "interviewee";

        return new ScheduledInterviewResponse(
                request.getId(),
                request.getMessage(),
                OpponentInfo.from(opponent),
                role,
                request.getScheduledAt(),
                "scheduled",
                "room_" + request.getId()
        );
    }
}
