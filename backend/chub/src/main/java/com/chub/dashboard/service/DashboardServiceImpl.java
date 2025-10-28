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

        long receivedRequests = interviewRequestRepository.countByInterviewerProfileIdAndStatus(userId, PENDING);
        long sentRequests = interviewRequestRepository.countByUserIdAndStatus(userId, PENDING);
        long scheduledInterviews = interviewRequestRepository.countByUserIdAndStatusOrInterviewerProfileIdAndStatus(
                userId, APPROVED, userId, APPROVED
        );
        long completedInterviews = interviewRequestRepository.countByUserIdAndStatusOrInterviewerProfileIdAndStatus(
                userId, COMPLETED, userId, COMPLETED
        );

        return DashboardStatsDto.builder()
                .receivedRequests(receivedRequests)
                .sentRequests(sentRequests)
                .scheduledInterviews(scheduledInterviews)
                .completedInterviews(completedInterviews)
                .build();
    }
}
