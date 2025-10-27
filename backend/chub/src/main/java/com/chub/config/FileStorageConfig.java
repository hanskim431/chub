package com.chub.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 파일 저장소 설정
 * - 업로드 디렉토리 자동 생성
 * - 정적 리소스 핸들러 등록 (파일 다운로드용)
 */
@Slf4j
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${app.file-storage.upload-dir:./uploads/resumes}")
    private String uploadDir;

    /**
     * 애플리케이션 시작 시 업로드 디렉토리를 생성합니다.
     */
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath);
            } else {
                log.info("Upload directory already exists: {}", uploadPath);
            }

        } catch (IOException e) {
            log.error("Failed to create upload directory: {}", uploadDir, e);
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    /**
     * 정적 리소스 핸들러 등록
     * /files/resumes/** 경로로 들어오는 요청을 실제 파일 시스템 경로로 매핑합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String resourceLocation = "file:" + uploadPath.toString() + "/";

        registry.addResourceHandler("/files/resumes/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0); // 캐싱 비활성화 (개발 환경용, 프로덕션에서는 조정 필요)

        log.info("Registered resource handler: /files/resumes/** -> {}", resourceLocation);
    }
}
