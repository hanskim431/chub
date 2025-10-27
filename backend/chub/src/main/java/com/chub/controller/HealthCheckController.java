package com.chub.controller;

import com.chub.common.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "서버 상태 확인 API")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "헬스체크", description = "서버 상태를 확인합니다")
    public ResponseEntity<CommonApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "CHUB");
        health.put("timestamp", LocalDateTime.now());
        health.put("message", "Server is running");

        return ResponseEntity.ok(CommonApiResponse.success(health));
    }
}
