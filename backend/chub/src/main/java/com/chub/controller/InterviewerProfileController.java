package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.request.UpdateInterviewerProfileRequest;
import com.chub.dto.response.InterviewerProfileListData;
import com.chub.dto.response.InterviewerProfileListItemResponse;
import com.chub.dto.response.InterviewerProfilePageResponse;
import com.chub.dto.response.InterviewerProfileResponse;
import com.chub.service.InterviewerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles/interviewers")
@RequiredArgsConstructor
@Tag(name = "면접관 프로필", description = "면접관 프로필 관리 API")
public class InterviewerProfileController {

    private final InterviewerProfileService interviewerProfileService;

    @GetMapping("/me")
    @Operation(
            summary = "내 면접관 프로필 조회",
            description = "인증된 사용자의 면접관 프로필을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "404", description = "프로필 없음", content = @Content)
    public ResponseEntity<CommonApiResponse<InterviewerProfileResponse>> getMyProfile(
            @LoginUser Long userId
    ) {
        InterviewerProfileResponse response = interviewerProfileService.getMyProfile(userId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @PostMapping("/me")
    @Operation(
            summary = "면접관 프로필 생성",
            description = "새로운 면접관 프로필을 생성합니다. 이미 프로필이 존재하는 경우 400 에러를 반환합니다."
    )
    @ApiResponse(responseCode = "200", description = "생성 성공")
    @ApiResponse(responseCode = "400", description = "이미 프로필 존재 또는 유효하지 않은 데이터", content = @Content)
    public ResponseEntity<CommonApiResponse<Void>> createProfile(
            @LoginUser Long userId,
            @Valid @RequestBody CreateInterviewerProfileRequest request
    ) {
        interviewerProfileService.createProfile(userId, request);
        return ResponseEntity.ok(CommonApiResponse.success());
    }

    @PatchMapping("/me")
    @Operation(
            summary = "면접관 프로필 수정",
            description = "면접관 프로필을 부분 수정합니다. null이 아닌 필드만 업데이트되며, 나머지 필드는 기존 값을 유지합니다. " +
                    "활성 상태만 변경하거나, 여러 필드를 동시에 수정할 수 있습니다."
    )
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @ApiResponse(responseCode = "404", description = "프로필 없음", content = @Content)
    @ApiResponse(responseCode = "400", description = "유효하지 않은 데이터", content = @Content)
    public ResponseEntity<CommonApiResponse<Void>> updateProfile(
            @LoginUser Long userId,
            @Valid @RequestBody UpdateInterviewerProfileRequest request
    ) {
        interviewerProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(CommonApiResponse.success());
    }

    @GetMapping
    @Operation(
            summary = "면접관 목록 조회",
            description = "활성화된 면접관 목록을 페이징 처리하여 조회합니다. field 필터를 통해 분야별 검색이 가능하며, 자기 자신은 목록에서 제외됩니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<PageResponse<InterviewerProfileListData>> getInterviewerProfiles(
            @LoginUser Long userId,
            @Parameter(description = "분야 필터 (부분 일치 검색)", example = "backend")
            @RequestParam(required = false) String field,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<InterviewerProfileListData> response = interviewerProfileService.getInterviewerProfiles(userId, field, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "면접관 상세 조회",
            description = "특정 면접관의 상세 프로필을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "404", description = "프로필 없음", content = @Content)
    public ResponseEntity<CommonApiResponse<InterviewerProfileResponse>> getInterviewerProfile(
            @Parameter(description = "면접관 프로필 ID", example = "1")
            @PathVariable Long id
    ) {
        InterviewerProfileResponse response = interviewerProfileService.getInterviewerProfileById(id);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }
}
