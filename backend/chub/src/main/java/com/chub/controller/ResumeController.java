package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.dto.response.ResumeResponse;
import com.chub.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume", description = "이력서 관리 API")
public class ResumeController {

    private final ResumeService resumeService;

    @Operation(summary = "내 이력서 조회", description = "로그인한 사용자의 최신 이력서를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<CommonApiResponse<ResumeResponse>> getMyResume(@LoginUser Long userId) {
        ResumeResponse response = resumeService.getMyResume(userId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(summary = "이력서 업로드", description = "PDF 형식의 이력서를 업로드합니다. (최대 10MB)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<Void>> uploadResume(
            @LoginUser Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        resumeService.uploadResume(userId, file);
        return ResponseEntity.ok(CommonApiResponse.success());
    }

    @Operation(summary = "내 이력서 삭제", description = "로그인한 사용자의 최신 이력서를 삭제합니다.")
    @DeleteMapping("/me")
    public ResponseEntity<CommonApiResponse<Void>> deleteMyResume(@LoginUser Long userId) {
        resumeService.deleteMyResume(userId);
        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
