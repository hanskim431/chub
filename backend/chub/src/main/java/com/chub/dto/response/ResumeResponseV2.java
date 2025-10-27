package com.chub.dto.response;

import com.chub.entity.Resume;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 이력서 조회 응답 DTO (V2)
 * API 명세: GET /profiles/resumes
 */
@Schema(description = "이력서 조회 응답")
public record ResumeResponseV2(
        @Schema(description = "이력서 PDF 파일 URL", example = "http://localhost:8080/files/resumes/resume_1_20250127143000.pdf")
        String pdfUrl
) {
    /**
     * Resume 엔티티로부터 응답 DTO를 생성합니다.
     *
     * @param resume Resume 엔티티
     * @return ResumeResponseV2
     */
    public static ResumeResponseV2 from(Resume resume) {
        return new ResumeResponseV2(resume.getPdfUrl());
    }
}
