package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewRequestRequest;
import com.chub.dto.request.UpdateRequestStatusRequest;
import com.chub.dto.response.InterviewRequestListData;
import com.chub.dto.response.InterviewRequestResponse;
import com.chub.dto.response.ReceivedInterviewRequestListData;
import com.chub.dto.response.ScheduledInterviewListData;
import com.chub.dto.response.ScheduledInterviewResponse;
import com.chub.service.InterviewRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = "면접 신청 관리", description = "면접 신청 및 관리 API")
public class InterviewRequestController {

    private final InterviewRequestService interviewRequestService;

    @PostMapping("/requests")
    @Operation(
            summary = "면접 신청",
            description = "면접관에게 면접을 신청합니다."
    )
    @ApiResponse(responseCode = "201", description = "신청 성공")
    @ApiResponse(responseCode = "400", description = "중복 신청 또는 유효하지 않은 데이터", content = @Content)
    @ApiResponse(responseCode = "404", description = "면접관 프로필 없음", content = @Content)
    public ResponseEntity<CommonApiResponse<Void>> createInterviewRequest(
            @LoginUser Long userId,
            @Valid @RequestBody CreateInterviewRequestRequest request
    ) {
        interviewRequestService.createInterviewRequest(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonApiResponse.success());
    }

    @GetMapping("/requests/me")
    @Operation(
            summary = "내가 보낸 면접 신청 목록",
            description = "내가 보낸 면접 신청 목록을 조회합니다. status 파라미터를 생략하면 모든 상태의 신청을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<PageResponse<InterviewRequestListData>> getMyRequests(
            @LoginUser Long userId,
            @Parameter(
                    description = "상태 필터 (선택, 생략 시 전체 조회)",
                    example = "PENDING",
                    required = false
            )
            @RequestParam(required = false) String status,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<InterviewRequestListData> response =
                interviewRequestService.getMyRequests(userId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/received")
    @Operation(
            summary = "받은 면접 신청 목록 (면접관용)",
            description = "면접관으로서 받은 면접 신청 목록을 조회합니다. PENDING 상태의 신청만 조회됩니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "404", description = "면접관 프로필 없음", content = @Content)
    public ResponseEntity<PageResponse<ReceivedInterviewRequestListData>> getReceivedRequests(
            @LoginUser Long userId,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReceivedInterviewRequestListData> response =
                interviewRequestService.getReceivedRequests(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/requests/{id}/status")
    @Operation(
            summary = "면접 신청 수락/거절 (면접관용)",
            description = "면접관으로서 받은 면접 신청을 수락하거나 거절합니다."
    )
    @ApiResponse(responseCode = "200", description = "상태 변경 성공")
    @ApiResponse(responseCode = "403", description = "권한 없음", content = @Content)
    @ApiResponse(responseCode = "404", description = "요청 없음", content = @Content)
    public ResponseEntity<CommonApiResponse<Void>> updateRequestStatus(
            @LoginUser Long userId,
            @Parameter(description = "면접 신청 ID", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody UpdateRequestStatusRequest request
    ) {
        interviewRequestService.updateRequestStatus(id, userId, request.accepted());
        return ResponseEntity.ok(CommonApiResponse.success());
    }

    @GetMapping("/scheduled")
    @Operation(
            summary = "예정된 면접 목록",
            description = "수락된(APPROVED) 예정된 면접 목록을 조회합니다. 면접관/면접대상자 모두 조회 가능합니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<CommonApiResponse<ScheduledInterviewListData>> getScheduledInterviews(
            @LoginUser Long userId
    ) {
        ScheduledInterviewListData response = interviewRequestService.getScheduledInterviews(userId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }
}
