package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.dto.response.ResumeResponseV2;
import com.chub.service.ResumeServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 이력서 관리 API V2
 * 로컬 파일 시스템을 사용하여 이력서를 관리합니다.
 */
@RestController
@RequestMapping("/api/v2/profiles/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume V2", description = "이력서 관리 API V2 (파일 시스템 사용)")
public class ResumeControllerV2 {

    private final ResumeServiceV2 resumeServiceV2;

    @Operation(
            summary = "내 이력서 조회",
            description = "로그인한 사용자의 이력서를 조회합니다. 사용자는 1개의 이력서만 가질 수 있습니다."
    )
    @GetMapping
    public ResponseEntity<CommonApiResponse<ResumeResponseV2>> getMyResume(
            @Parameter(hidden = true) @LoginUser Long userId
    ) {
        ResumeResponseV2 response = resumeServiceV2.getMyResume(userId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(
            summary = "이력서 업로드/수정",
            description = """
                    PDF 형식의 이력서를 업로드하거나 수정합니다.
                    - 기존 이력서가 없으면 새로 생성
                    - 기존 이력서가 있으면 덮어쓰기
                    - 파일 크기 제한: 10MB
                    - 허용 형식: PDF
                    """
    )
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<Void>> uploadOrUpdateResume(
            @Parameter(hidden = true) @LoginUser Long userId,
            @Parameter(description = "이력서 PDF 파일", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        resumeServiceV2.uploadOrUpdateResume(userId, file);
        return ResponseEntity.ok(CommonApiResponse.success());
    }

    @Operation(
            summary = "내 이력서 삭제",
            description = "로그인한 사용자의 이력서를 삭제합니다. DB 레코드와 물리적 파일이 모두 삭제됩니다."
    )
    @DeleteMapping("/me")
    public ResponseEntity<CommonApiResponse<Void>> deleteMyResume(
            @Parameter(hidden = true) @LoginUser Long userId
    ) {
        resumeServiceV2.deleteMyResume(userId);
        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
