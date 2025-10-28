package com.chub.config;

import jakarta.annotation.PostConstruct;
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
            }

        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    /**
     * 정적 리소스 핸들러 등록
     * /files/resumes/** 경로로 들어오는 요청을 실제 파일 시스템 경로로 매핑합니다.
     *
     * 주의: 배포 환경에서는 nginx가 정적 파일을 직접 서빙하므로 이 핸들러는 사용되지 않습니다.
     * 로컬 개발 환경에서만 Spring Boot가 파일을 서빙합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String resourceLocation = "file:" + uploadPath.toString() + "/";

        registry.addResourceHandler("/files/resumes/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0); // 캐싱 비활성화 (개발 환경용)
    }
}
