package com.chub.dashboard.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.dashboard.dto.DashboardStatsDto;
import com.chub.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<CommonApiResponse<DashboardStatsDto>> getDashboardStats(@LoginUser Long userId) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(userId);
        return ResponseEntity.ok(CommonApiResponse.success(stats));
    }
}
