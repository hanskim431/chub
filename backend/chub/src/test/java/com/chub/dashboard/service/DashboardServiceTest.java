package com.chub.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.chub.dashboard.dto.DashboardStatsDto;
import com.chub.repository.InterviewRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private InterviewRequestRepository interviewRequestRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String COMPLETED = "COMPLETED";
    private static final Long USER_ID = 1L;
    private static final Long USER_ID_WRONG = 999L;
    private static final Long SENT_PENDING_COUNT = 1L;
    private static final Long RECEIVED_PENDING_COUNT = 3L;
    private static final Long APPROVED_COUNT = 5L;
    private static final Long COMPLETED_COUNT = 7L;

    @Test
    void getStats_success() {
        // given
        when(interviewRequestRepository.countByUserIdAndStatus(USER_ID, PENDING)).thenReturn(SENT_PENDING_COUNT);
        when(interviewRequestRepository.countByInterviewerProfileIdAndStatus(USER_ID, PENDING)).thenReturn(
                RECEIVED_PENDING_COUNT);
        when(interviewRequestRepository.countByUserIdAndStatusOrInterviewerProfileIdAndStatus(
                USER_ID, APPROVED, USER_ID, APPROVED)).thenReturn(APPROVED_COUNT);
        when(interviewRequestRepository.countByUserIdAndStatusOrInterviewerProfileIdAndStatus(
                USER_ID, COMPLETED, USER_ID, COMPLETED)).thenReturn(COMPLETED_COUNT);

        // when
        DashboardStatsDto dashboardStatsDto = dashboardService.getDashboardStats(USER_ID);

        // then
        assertThat(dashboardStatsDto.getSentRequests()).isEqualTo(SENT_PENDING_COUNT);
        assertThat(dashboardStatsDto.getReceivedRequests()).isEqualTo(RECEIVED_PENDING_COUNT);
        assertThat(dashboardStatsDto.getScheduledInterviews()).isEqualTo(APPROVED_COUNT);
        assertThat(dashboardStatsDto.getCompletedInterviews()).isEqualTo(COMPLETED_COUNT);
    }
}
