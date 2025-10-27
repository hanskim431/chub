package com.chub.service;

import com.chub.exception.resume.ResumeException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("FileStorageService 단위 테스트")
class FileStorageServiceTest {

    @Mock
    private MultipartFile file;

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;
    private String baseUrl;

    private static final Long TEST_USER_ID = 1L;
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private final byte[] testFileBytes = "test pdf content".getBytes();

    @BeforeEach
    void setUp() {
        String uploadDir = tempDir.toString();
        baseUrl = "http://localhost:8080/files/resumes";
        fileStorageService = new FileStorageService(uploadDir, baseUrl);
    }

    @Nested
    @DisplayName("storeFile 메서드")
    class StoreFileTest {

        @Test
        @DisplayName("성공: 유효한 PDF 파일 저장")
        void storeFile_Success() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willReturn(new ByteArrayInputStream(testFileBytes));

            // when
            String fileUrl = fileStorageService.storeFile(file, TEST_USER_ID);

            // then
            assertThat(fileUrl).isNotNull();
            assertThat(fileUrl).startsWith(baseUrl);
            assertThat(fileUrl).contains("resume_" + TEST_USER_ID);
            assertThat(fileUrl).endsWith(".pdf");

            // 파일이 실제로 저장되었는지 확인
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path savedFilePath = tempDir.resolve(fileName);
            assertThat(Files.exists(savedFilePath)).isTrue();
            assertThat(Files.readAllBytes(savedFilePath)).isEqualTo(testFileBytes);
        }

        @Test
        @DisplayName("성공: 저장된 파일명에 타임스탬프 포함")
        void storeFile_ContainsTimestamp() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willReturn(new ByteArrayInputStream(testFileBytes));

            // when
            String fileUrl = fileStorageService.storeFile(file, TEST_USER_ID);

            // then
            // 파일명 형식: resume_{userId}_{timestamp}.pdf
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            assertThat(fileName).matches("resume_1_\\d{14}\\.pdf");
        }

        @Test
        @DisplayName("실패: null 파일 업로드 시 ResumeException 발생")
        void storeFile_NullFile() {
            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(null, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class)
                    .hasMessageContaining("파일");
        }

        @Test
        @DisplayName("실패: 빈 파일 업로드 시 ResumeException 발생")
        void storeFile_EmptyFile() {
            // given
            given(file.isEmpty()).willReturn(true);

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }

        @Test
        @DisplayName("실패: PDF가 아닌 파일 타입 업로드 시 ResumeException 발생")
        void storeFile_InvalidContentType() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn("image/jpeg");

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }

        @Test
        @DisplayName("실패: 10MB 초과 파일 업로드 시 ResumeException 발생")
        void storeFile_FileSizeExceeded() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(MAX_FILE_SIZE + 1);

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }

        @Test
        @DisplayName("실패: PDF 확장자가 아닌 파일명 업로드 시 ResumeException 발생")
        void storeFile_InvalidFileExtension() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.txt");

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }

        @Test
        @DisplayName("실패: 파일명이 null인 경우 ResumeException 발생")
        void storeFile_NullFileName() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn(null);

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }

        @Test
        @DisplayName("실패: IOException 발생 시 ResumeException 발생")
        void storeFile_IOExceptionThrown() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willThrow(new IOException("File read error"));

            // when & then
            assertThatThrownBy(() -> fileStorageService.storeFile(file, TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
        }
    }

    @Nested
    @DisplayName("deleteFile 메서드")
    class DeleteFileTest {

        @Test
        @DisplayName("성공: 존재하는 파일 삭제")
        void deleteFile_Success() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willReturn(new ByteArrayInputStream(testFileBytes));

            String fileUrl = fileStorageService.storeFile(file, TEST_USER_ID);
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path savedFilePath = tempDir.resolve(fileName);

            // 파일이 저장되었는지 확인
            assertThat(Files.exists(savedFilePath)).isTrue();

            // when
            fileStorageService.deleteFile(fileUrl);

            // then
            assertThat(Files.exists(savedFilePath)).isFalse();
        }

        @Test
        @DisplayName("성공: 존재하지 않는 파일 삭제 시도 시 예외 발생하지 않음")
        void deleteFile_FileNotExists() {
            // given
            String nonExistentFileUrl = baseUrl + "/non_existent_file.pdf";

            // when & then
            // 예외가 발생하지 않아야 함
            fileStorageService.deleteFile(nonExistentFileUrl);
        }

        @Test
        @DisplayName("성공: null URL 삭제 시도 시 예외 발생하지 않음")
        void deleteFile_NullUrl() {
            // when & then
            // 예외가 발생하지 않아야 함
            fileStorageService.deleteFile(null);
        }

        @Test
        @DisplayName("성공: 빈 URL 삭제 시도 시 예외 발생하지 않음")
        void deleteFile_EmptyUrl() {
            // when & then
            // 예외가 발생하지 않아야 함
            fileStorageService.deleteFile("");
        }
    }

    @Nested
    @DisplayName("파일명 추출 테스트")
    class ExtractFileNameTest {

        @Test
        @DisplayName("성공: URL에서 파일명 정확히 추출")
        void extractFileName_Success() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willReturn(new ByteArrayInputStream(testFileBytes));

            String fileUrl = fileStorageService.storeFile(file, TEST_USER_ID);

            // when
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

            // then
            assertThat(fileName).startsWith("resume_" + TEST_USER_ID);
            assertThat(fileName).endsWith(".pdf");
            assertThat(fileName).matches("resume_\\d+_\\d{14}\\.pdf");
        }
    }

    @Nested
    @DisplayName("파일 저장 경로 테스트")
    class FilePathTest {

        @Test
        @DisplayName("성공: 설정된 디렉토리에 파일 저장")
        void fileStoredInCorrectDirectory() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream()).willReturn(new ByteArrayInputStream(testFileBytes));

            // when
            String fileUrl = fileStorageService.storeFile(file, TEST_USER_ID);

            // then
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path expectedPath = tempDir.resolve(fileName);
            assertThat(Files.exists(expectedPath)).isTrue();
        }
    }

    @Nested
    @DisplayName("동시성 테스트")
    class ConcurrencyTest {

        @Test
        @DisplayName("성공: 같은 사용자가 동시에 업로드해도 다른 파일명 생성")
        void storeFile_ConcurrentUploads() throws IOException, InterruptedException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getOriginalFilename()).willReturn("resume.pdf");
            given(file.getInputStream())
                    .willReturn(new ByteArrayInputStream(testFileBytes))
                    .willReturn(new ByteArrayInputStream(testFileBytes));

            // when
            String fileUrl1 = fileStorageService.storeFile(file, TEST_USER_ID);
            Thread.sleep(1000); // 1초 대기 (타임스탬프 다르게 하기 위해)
            String fileUrl2 = fileStorageService.storeFile(file, TEST_USER_ID);

            // then
            assertThat(fileUrl1).isNotEqualTo(fileUrl2);

            String fileName1 = fileUrl1.substring(fileUrl1.lastIndexOf('/') + 1);
            String fileName2 = fileUrl2.substring(fileUrl2.lastIndexOf('/') + 1);
            assertThat(fileName1).isNotEqualTo(fileName2);
        }
    }
}
