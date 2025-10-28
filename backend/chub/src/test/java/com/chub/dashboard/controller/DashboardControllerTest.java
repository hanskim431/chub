package com.chub.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chub.auth.security.CustomUserDetails;
import com.chub.dashboard.dto.DashboardStatsDto;
import com.chub.dashboard.service.DashboardService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DashboardController.class)
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    private static final long RECEIVED_REQUESTS = 1L;
    private static final long SENT_REQUESTS = 3L;
    private static final long SCHEDULED_INTERVIEWS = 5L;
    private static final long COMPLETED_INTERVIEWS = 7L;
    private static final Long USER_ID = 1L;
    private static final String USER_NAME = "test_user";
    private static final String USER_ROLE = "ROLE_USER";

    @Test
    void getDashboard_Success() throws Exception {
        // given
        setMockUser(USER_ID); // Mock User 설정

        DashboardStatsDto expected = DashboardStatsDto.builder()
                .receivedRequests(RECEIVED_REQUESTS)
                .sentRequests(SENT_REQUESTS)
                .scheduledInterviews(SCHEDULED_INTERVIEWS)
                .completedInterviews(COMPLETED_INTERVIEWS)
                .build();
        when(dashboardService.getDashboardStats(USER_ID)).thenReturn(expected);

        // when & then
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receivedRequests").value(RECEIVED_REQUESTS))
                .andExpect(jsonPath("$.data.sentRequests").value(SENT_REQUESTS))
                .andExpect(jsonPath("$.data.scheduledInterviews").value(SCHEDULED_INTERVIEWS))
                .andExpect(jsonPath("$.data.completedInterviews").value(COMPLETED_INTERVIEWS));
    }

    /**
     * 테스트용 Mock User를 SecurityContext에 설정하는 헬퍼 메서드 LoginUserArgumentResolver가 SecurityContext에서 userId를 추출할 수 있도록 설정
     */
    private void setMockUser(Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                USER_NAME,
                List.of(new SimpleGrantedAuthority(USER_ROLE))
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
