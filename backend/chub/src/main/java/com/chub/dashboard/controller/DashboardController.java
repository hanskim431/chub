package com.chub.dashboard.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.dashboard.dto.DashboardStatsDto;
import com.chub.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "대시보드 API")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(
            summary = "대시보드 통계 조회",
            description = "사용자의 면접 관련 통계를 조회합니다. (받은 요청 수, 보낸 요청 수, 예정된 면접 수, 완료된 면접 수)"
    )
    @GetMapping("/stats")
    public ResponseEntity<CommonApiResponse<DashboardStatsDto>> getDashboardStats(@LoginUser Long userId) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(userId);
        return ResponseEntity.ok(CommonApiResponse.success(stats));
    }
}
