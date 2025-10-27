package com.chub.service;

import com.chub.exception.resume.ResumeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * 파일 저장소 서비스
 * 로컬 파일 시스템에 이력서 PDF 파일을 저장/삭제/조회하는 책임을 가집니다.
 */
@Slf4j
@Service
public class FileStorageService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final Path uploadDir;
    private final String baseUrl;

    public FileStorageService(
            @Value("${app.file-storage.upload-dir:./uploads/resumes}") String uploadDir,
            @Value("${app.file-storage.base-url:http://localhost:8080/files/resumes}") String baseUrl
    ) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        log.info("FileStorageService initialized - upload directory: {}", this.uploadDir);
    }

    /**
     * 파일을 저장하고 접근 가능한 URL을 반환합니다.
     *
     * @param file   업로드할 파일
     * @param userId 사용자 ID
     * @return 파일 접근 URL
     */
    public String storeFile(MultipartFile file, Long userId) {
        validateFile(file);

        try {
            // 파일명 생성: resume_{userId}_{timestamp}.pdf
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
            String fileName = String.format("resume_%d_%s.pdf", userId, timestamp);
            Path targetLocation = uploadDir.resolve(fileName);

            // 파일 저장
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("File stored successfully: {}", fileName);

            // URL 반환
            return baseUrl + "/" + fileName;

        } catch (IOException e) {
            log.error("Failed to store file for user {}: {}", userId, e.getMessage(), e);
            throw ResumeException.fileUploadFailed();
        }
    }

    /**
     * URL에서 파일을 삭제합니다.
     *
     * @param fileUrl 삭제할 파일의 URL
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // URL에서 파일명 추출
            String fileName = extractFileNameFromUrl(fileUrl);
            Path filePath = uploadDir.resolve(fileName);

            // 파일 삭제
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", fileName);
            } else {
                log.warn("File not found for deletion: {}", fileName);
            }

        } catch (IOException e) {
            // 파일 삭제 실패는 로그만 남기고 예외를 던지지 않음 (DB 트랜잭션은 정상 처리)
            log.error("Failed to delete file {}: {}", fileUrl, e.getMessage(), e);
        }
    }

    /**
     * 파일 유효성 검증
     */
    private void validateFile(MultipartFile file) {
        // 파일이 비어있는지 확인
        if (file == null || file.isEmpty()) {
            throw ResumeException.invalidFileType();
        }

        // PDF 파일 타입 확인
        String contentType = file.getContentType();
        if (!PDF_CONTENT_TYPE.equals(contentType)) {
            throw ResumeException.invalidFileType();
        }

        // 파일 크기 확인 (10MB 제한)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw ResumeException.fileSizeExceeded();
        }

        // 파일명 확인
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw ResumeException.invalidFileType();
        }
    }

    /**
     * URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    }
}
