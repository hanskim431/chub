package com.chub.service;

import com.chub.dto.response.ResumeResponseV2;
import com.chub.entity.Resume;
import com.chub.entity.User;
import com.chub.exception.resume.ResumeException;
import com.chub.exception.user.UserException;
import com.chub.repository.ResumeRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * 이력서 서비스 구현체 V2
 * 로컬 파일 시스템을 사용하여 이력서를 관리합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeServiceV2Impl implements ResumeServiceV2 {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    public ResumeResponseV2 getMyResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(ResumeException::resumeNotFound);

        return ResumeResponseV2.from(resume);
    }

    @Override
    @Transactional
    public void uploadOrUpdateResume(Long userId, MultipartFile file) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);

        // 기존 이력서 조회
        Optional<Resume> existingResume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId);

        // 기존 파일이 있으면 삭제
        if (existingResume.isPresent()) {
            String oldFileUrl = existingResume.get().getPdfUrl();
            fileStorageService.deleteFile(oldFileUrl);
            log.info("Deleted old resume file for user {}: {}", userId, oldFileUrl);
        }

        // 새 파일 저장
        String newFileUrl = fileStorageService.storeFile(file, userId);
        log.info("Stored new resume file for user {}: {}", userId, newFileUrl);

        // Resume 엔티티 업데이트 또는 생성
        if (existingResume.isPresent()) {
            // 기존 이력서 업데이트 (덮어쓰기)
            Resume resume = existingResume.get();
            resume.updatePdfUrl(newFileUrl);
            log.info("Updated existing resume for user {}", userId);
        } else {
            // 새 이력서 생성
            Resume newResume = Resume.of(user, newFileUrl);
            resumeRepository.save(newResume);
            log.info("Created new resume for user {}", userId);
        }
    }

    @Override
    @Transactional
    public void deleteMyResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(ResumeException::resumeNotFound);

        // 물리적 파일 삭제
        fileStorageService.deleteFile(resume.getPdfUrl());
        log.info("Deleted resume file for user {}: {}", userId, resume.getPdfUrl());

        // DB에서 삭제
        resumeRepository.delete(resume);
        log.info("Deleted resume record for user {}", userId);
    }
}
