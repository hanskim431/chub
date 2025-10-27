package com.chub.service;

import static com.chub.exception.resume.ResumeException.fileUploadFailed;
import static com.chub.exception.resume.ResumeException.invalidFileType;

import com.chub.dto.response.ResumeResponse;
import com.chub.entity.Resume;
import com.chub.entity.User;
import com.chub.exception.resume.ResumeException;
import com.chub.exception.user.UserException;
import com.chub.repository.ResumeRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeServiceImpl implements ResumeService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String DATA_URL_PREFIX = "data:application/pdf;base64,";

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Override
    public ResumeResponse getMyResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(ResumeException::resumeNotFound);

        return ResumeResponse.from(resume);
    }

    @Override
    @Transactional
    public void uploadResume(Long userId, MultipartFile file) {
        // 파일 검증
        validateFile(file);

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);

        try {
            // Base64 인코딩
            byte[] fileBytes = file.getBytes();
            String base64Encoded = Base64.getEncoder().encodeToString(fileBytes);
            String dataUrl = DATA_URL_PREFIX + base64Encoded;

            // Resume 엔티티 생성 및 저장
            Resume resume = Resume.of(user, dataUrl);
            resumeRepository.save(resume);

        } catch (Exception e) {
            throw fileUploadFailed();
        }
    }

    @Override
    @Transactional
    public void deleteMyResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(ResumeException::resumeNotFound);

        resumeRepository.delete(resume);
    }

    private void validateFile(MultipartFile file) {
        // 파일이 비어있는지 확인
        if (file == null || file.isEmpty()) {
            throw invalidFileType();
        }

        // PDF 파일 타입 확인
        String contentType = file.getContentType();
        if (!PDF_CONTENT_TYPE.equals(contentType)) {
            throw invalidFileType();
        }

        // 파일 크기 확인 (10MB 제한)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw ResumeException.fileSizeExceeded();
        }
    }
}
