package com.chub.dashboard.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DashboardStatsDto {

    private long receivedRequests;
    private long sentRequests;
    private long scheduledInterviews;
    private long completedInterviews;
}
