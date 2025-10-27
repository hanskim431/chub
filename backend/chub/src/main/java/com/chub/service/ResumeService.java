package com.chub.service;

import com.chub.dto.response.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeService {

    /**
     * 사용자의 최신 이력서 조회
     * @param userId 사용자 ID
     * @return 이력서 응답 (pdfUrl 포함)
     */
    ResumeResponse getMyResume(Long userId);

    /**
     * 이력서 업로드 (PDF 파일)
     * @param userId 사용자 ID
     * @param file PDF 파일
     */
    void uploadResume(Long userId, MultipartFile file);

    /**
     * 사용자의 최신 이력서 삭제
     * @param userId 사용자 ID
     */
    void deleteMyResume(Long userId);
}
