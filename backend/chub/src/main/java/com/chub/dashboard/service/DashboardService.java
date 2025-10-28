package com.chub.dashboard.service;

import com.chub.dashboard.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getDashboardStats(Long userId);
}
