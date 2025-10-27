package com.chub.service;

import com.chub.dto.response.ResumeResponse;
import com.chub.entity.Resume;
import com.chub.entity.User;
import com.chub.exception.resume.ResumeException;
import com.chub.exception.user.UserException;
import com.chub.repository.ResumeRepository;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static java.util.Optional.empty;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResumeServiceImpl 단위 테스트")
class ResumeServiceImplTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private ResumeServiceImpl resumeService;

    private User testUser;
    private Resume testResume;
    private static final Long TEST_USER_ID = 1L;
    private static final String TEST_PDF_URL = "data:application/pdf;base64,JVBERi0xLjQK";

    @BeforeEach
    void setUp() {
        testUser = User.of("test-sub-123", "testUser");
        testResume = Resume.of(testUser, TEST_PDF_URL);
    }

    @Nested
    @DisplayName("getMyResume 메서드")
    class GetMyResumeTest {

        @Test
        @DisplayName("성공: 최신 이력서 조회")
        void getMyResume_Success() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(testResume));

            // when
            ResumeResponse response = resumeService.getMyResume(TEST_USER_ID);

            // then
            assertThat(response).isNotNull();
            assertThat(response.pdfUrl()).isEqualTo(TEST_PDF_URL);
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
        }

        @Test
        @DisplayName("실패: 이력서가 없을 때 ResumeException 발생")
        void getMyResume_ResumeNotFound() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> resumeService.getMyResume(TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("uploadResume 메서드")
    class UploadResumeTest {

        private static final String PDF_CONTENT_TYPE = "application/pdf";
        private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        private final byte[] testFileBytes = "test pdf content".getBytes();

        @Test
        @DisplayName("성공: 유효한 PDF 파일 업로드")
        void uploadResume_Success() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L); // 1KB
            given(file.getBytes()).willReturn(testFileBytes);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // when
            resumeService.uploadResume(TEST_USER_ID, file);

            // then
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(resumeRepository, times(1)).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: null 파일 업로드 시 ResumeException 발생")
        void uploadResume_NullFile() {
            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, null))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: 빈 파일 업로드 시 ResumeException 발생")
        void uploadResume_EmptyFile() {
            // given
            given(file.isEmpty()).willReturn(true);

            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, file))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: PDF가 아닌 파일 타입 업로드 시 ResumeException 발생")
        void uploadResume_InvalidFileType() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn("image/jpeg");

            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, file))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: 10MB 초과 파일 업로드 시 ResumeException 발생")
        void uploadResume_FileSizeExceeded() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(MAX_FILE_SIZE + 1); // 10MB + 1byte

            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, file))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: 사용자가 존재하지 않을 때 UserException 발생")
        void uploadResume_UserNotFound() {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(userRepository.findById(TEST_USER_ID)).willReturn(empty());

            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, file))
                    .isInstanceOf(UserException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }

        @Test
        @DisplayName("실패: IOException 발생 시 ResumeException 발생")
        void uploadResume_IOExceptionThrown() throws IOException {
            // given
            given(file.isEmpty()).willReturn(false);
            given(file.getContentType()).willReturn(PDF_CONTENT_TYPE);
            given(file.getSize()).willReturn(1024L);
            given(file.getBytes()).willThrow(new IOException("File read error"));
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // when & then
            assertThatThrownBy(() -> resumeService.uploadResume(TEST_USER_ID, file))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, never()).save(any(Resume.class));
        }
    }

    @Nested
    @DisplayName("deleteMyResume 메서드")
    class DeleteMyResumeTest {

        @Test
        @DisplayName("성공: 이력서 삭제")
        void deleteMyResume_Success() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(testResume));

            // when
            resumeService.deleteMyResume(TEST_USER_ID);

            // then
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
            verify(resumeRepository, times(1)).delete(testResume);
        }

        @Test
        @DisplayName("실패: 이력서가 없을 때 ResumeException 발생")
        void deleteMyResume_ResumeNotFound() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> resumeService.deleteMyResume(TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
            verify(resumeRepository, never()).delete(any(Resume.class));
        }
    }
}
