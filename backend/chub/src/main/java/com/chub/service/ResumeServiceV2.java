package com.chub.service;

import com.chub.dto.response.ResumeResponseV2;
import org.springframework.web.multipart.MultipartFile;

/**
 * 이력서 서비스 V2
 * 로컬 파일 시스템을 사용하여 이력서를 관리합니다.
 */
public interface ResumeServiceV2 {

    /**
     * 사용자의 이력서를 조회합니다.
     * 사용자는 1개의 이력서만 가질 수 있으므로 가장 최신 이력서를 반환합니다.
     *
     * @param userId 사용자 ID
     * @return 이력서 응답 (pdfUrl 포함)
     */
    ResumeResponseV2 getMyResume(Long userId);

    /**
     * 이력서를 업로드하거나 수정합니다.
     * - 기존 이력서가 없으면 새로 생성
     * - 기존 이력서가 있으면 업데이트 (덮어쓰기)
     *
     * @param userId 사용자 ID
     * @param file   PDF 파일
     */
    void uploadOrUpdateResume(Long userId, MultipartFile file);

    /**
     * 사용자의 이력서를 삭제합니다.
     *
     * @param userId 사용자 ID
     */
    void deleteMyResume(Long userId);
}
