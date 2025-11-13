package com.chub.Interview.dto;

import com.chub.entity.Interview;
import com.chub.interviewroom.dto.OpponentDto;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class InterviewRecordDetailDto {
    private Long id;
    private String sessionId;
    private OpponentDto opponent;
    private String role;  // "interviewer" or "interviewee"
    private LocalDateTime date;  // 면접 종료 일시
    private Long duration;  // 면접 소요 시간 (초)
    private List<TranscriptDto> transcript;

    public static InterviewRecordDetailDto from(Interview interview, Long currentUserId,
                                                List<TranscriptDto> transcript) {
        // 현재 사용자가 면접관인지 면접자인지 판단
        boolean isInterviewer = interview.getInterviewerProfile().getUser().getId().equals(currentUserId);

        // 상대방 정보
        OpponentDto opponent = isInterviewer
                ? OpponentDto.builder()
                .id(interview.getResume().getUser().getId())
                .name(interview.getResume().getUser().getUsername())
                .avatar(interview.getResume().getUser().getAvatarUrl())
                .build()
                : OpponentDto.builder()
                        .id(interview.getInterviewerProfile().getUser().getId())
                        .name(interview.getInterviewerProfile().getUser().getUsername())
                        .avatar(interview.getInterviewerProfile().getUser().getAvatarUrl())
                        .build();

        // 면접 소요 시간 계산
        Long duration = null;
        if (interview.getStartedAt() != null && interview.getEndedAt() != null) {
            duration = Duration.between(interview.getStartedAt(), interview.getEndedAt()).getSeconds();
        }

        return InterviewRecordDetailDto.builder()
                .id(interview.getId())
                .sessionId(interview.getTitle())  // title을 sessionId로 사용
                .opponent(opponent)
                .role(isInterviewer ? "interviewer" : "interviewee")
                .date(interview.getEndedAt())
                .duration(duration)
                .transcript(transcript)
                .build();
    }
}
