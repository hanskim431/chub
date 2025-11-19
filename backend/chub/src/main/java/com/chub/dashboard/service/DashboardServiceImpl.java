package com.chub.dashboard.service;

import com.chub.dashboard.dto.DashboardStatsDto;
import com.chub.repository.InterviewRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final InterviewRequestRepository interviewRequestRepository;

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String COMPLETED = "COMPLETED";

    @Override
    public DashboardStatsDto getDashboardStats(Long userId) {

        long receivedRequests = interviewRequestRepository.countByInterviewerUserIdAndStatus(userId, PENDING);
        long sentRequests = interviewRequestRepository.countByUserIdAndStatus(userId, PENDING);

        // 예정된 면접: 면접관으로서 / 면접자로서 구분
        long scheduledInterviewsAsInterviewer = interviewRequestRepository.countByInterviewerUserIdAndStatus(userId, APPROVED);
        long scheduledInterviewsAsInterviewee = interviewRequestRepository.countByUserIdAndStatus(userId, APPROVED);

        // 완료된 면접: 면접관으로서 / 면접자로서 구분
        long completedInterviewsAsInterviewer = interviewRequestRepository.countByInterviewerUserIdAndStatus(userId, COMPLETED);
        long completedInterviewsAsInterviewee = interviewRequestRepository.countByUserIdAndStatus(userId, COMPLETED);

        return DashboardStatsDto.builder()
                .receivedRequests(receivedRequests)
                .sentRequests(sentRequests)
                .scheduledInterviewsAsInterviewer(scheduledInterviewsAsInterviewer)
                .scheduledInterviewsAsInterviewee(scheduledInterviewsAsInterviewee)
                .completedInterviewsAsInterviewer(completedInterviewsAsInterviewer)
                .completedInterviewsAsInterviewee(completedInterviewsAsInterviewee)
                .build();
    }
}
