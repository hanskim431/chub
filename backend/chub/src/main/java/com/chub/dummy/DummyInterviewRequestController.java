package com.chub.dummy;

import com.chub.common.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev/data/interview-requests")
@RequiredArgsConstructor
@Tag(name = "더미 데이터 API", description = "개발용 더미 데이터 생성/삭제 API")
public class DummyInterviewRequestController {

    private final DummyInterviewRequestService dummyInterviewRequestService;

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "면접 요청 상태 강제 변경 (개발용)",
            description = """
                    면접 요청의 상태를 강제로 변경합니다. 개발 및 테스트용으로만 사용하세요.
                    권한 검증 없이 상태만 직접 변경됩니다.

                    **지원 상태**:
                    - PENDING: 대기중 (신청 직후 기본 상태)
                    - APPROVED: 승인됨 (면접관이 승인)
                    - REJECTED: 거절됨 (면접관이 거절)
                    - CANCELLED: 취소됨 (신청자가 취소)
                    - COMPLETED: 완료됨 (면접 완료)
                    """
    )
    @ApiResponse(responseCode = "200", description = "상태 변경 성공")
    @ApiResponse(responseCode = "400", description = "유효하지 않은 상태 값")
    @ApiResponse(responseCode = "404", description = "해당 ID의 면접 요청 없음")
    public ResponseEntity<CommonApiResponse<Void>> forceUpdateStatus(
            @Parameter(description = "면접 요청 ID", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody ForceUpdateInterviewRequestStatusRequest request
    ) {
        dummyInterviewRequestService.forceUpdateStatus(id, request.status());
        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
