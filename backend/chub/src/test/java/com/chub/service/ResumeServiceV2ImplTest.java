package com.chub.service;

import com.chub.dto.response.ResumeResponseV2;
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

import java.util.Optional;

import static java.util.Optional.empty;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResumeServiceV2Impl 단위 테스트")
class ResumeServiceV2ImplTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private ResumeServiceV2Impl resumeServiceV2;

    private User testUser;
    private Resume testResume;
    private static final Long TEST_USER_ID = 1L;
    private static final String TEST_PDF_URL = "http://localhost:8080/files/resumes/resume_1_20250127143000.pdf";
    private static final String NEW_PDF_URL = "http://localhost:8080/files/resumes/resume_1_20250127153000.pdf";

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
            ResumeResponseV2 response = resumeServiceV2.getMyResume(TEST_USER_ID);

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
            assertThatThrownBy(() -> resumeServiceV2.getMyResume(TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("uploadOrUpdateResume 메서드")
    class UploadOrUpdateResumeTest {

        @Nested
        @DisplayName("신규 업로드 시나리오")
        class NewUploadTest {

            @Test
            @DisplayName("성공: 이력서가 없을 때 새로 생성")
            void uploadOrUpdateResume_CreateNew() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
                given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                        .willReturn(empty());
                given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(NEW_PDF_URL);

                // when
                resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);

                // then
                verify(userRepository, times(1)).findById(TEST_USER_ID);
                verify(resumeRepository, times(1))
                        .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
                verify(fileStorageService, never()).deleteFile(anyString()); // 기존 파일 없으므로 삭제 안함
                verify(fileStorageService, times(1)).storeFile(file, TEST_USER_ID);
                verify(resumeRepository, times(1)).save(any(Resume.class));
            }

            @Test
            @DisplayName("실패: 사용자가 존재하지 않을 때 UserException 발생")
            void uploadOrUpdateResume_UserNotFound() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(empty());

                // when & then
                assertThatThrownBy(() -> resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file))
                        .isInstanceOf(UserException.class);
                verify(fileStorageService, never()).storeFile(any(), any());
                verify(resumeRepository, never()).save(any(Resume.class));
            }
        }

        @Nested
        @DisplayName("덮어쓰기 시나리오")
        class UpdateExistingTest {

            @Test
            @DisplayName("성공: 기존 이력서가 있을 때 덮어쓰기")
            void uploadOrUpdateResume_UpdateExisting() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
                given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                        .willReturn(Optional.of(testResume));
                given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(NEW_PDF_URL);

                // when
                resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);

                // then
                verify(userRepository, times(1)).findById(TEST_USER_ID);
                verify(resumeRepository, times(1))
                        .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
                verify(fileStorageService, times(1)).deleteFile(TEST_PDF_URL); // 기존 파일 삭제
                verify(fileStorageService, times(1)).storeFile(file, TEST_USER_ID);
                verify(resumeRepository, never()).save(any(Resume.class)); // 기존 엔티티 업데이트, save 호출 안함
                assertThat(testResume.getPdfUrl()).isEqualTo(NEW_PDF_URL); // URL 업데이트 확인
            }

            @Test
            @DisplayName("성공: 파일 저장 순서 검증 (삭제 → 저장)")
            void uploadOrUpdateResume_CorrectOrder() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
                given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                        .willReturn(Optional.of(testResume));
                given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(NEW_PDF_URL);

                // when
                resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);

                // then
                // 기존 파일 삭제가 새 파일 저장보다 먼저 호출되어야 함
                var inOrder = inOrder(fileStorageService);
                inOrder.verify(fileStorageService).deleteFile(TEST_PDF_URL);
                inOrder.verify(fileStorageService).storeFile(file, TEST_USER_ID);
            }
        }

        @Nested
        @DisplayName("예외 처리 시나리오")
        class ExceptionHandlingTest {

            @Test
            @DisplayName("실패: 파일 저장 중 예외 발생 시 전파")
            void uploadOrUpdateResume_FileStorageException() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
                given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                        .willReturn(empty());
                given(fileStorageService.storeFile(file, TEST_USER_ID))
                        .willThrow(ResumeException.fileUploadFailed());

                // when & then
                assertThatThrownBy(() -> resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file))
                        .isInstanceOf(ResumeException.class);
                verify(resumeRepository, never()).save(any(Resume.class));
            }

            @Test
            @DisplayName("성공: 기존 파일 삭제 실패해도 계속 진행")
            void uploadOrUpdateResume_DeleteFailureContinues() {
                // given
                given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
                given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                        .willReturn(Optional.of(testResume));
                doNothing().when(fileStorageService).deleteFile(TEST_PDF_URL); // 삭제는 예외를 던지지 않음
                given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(NEW_PDF_URL);

                // when
                resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);

                // then
                verify(fileStorageService, times(1)).deleteFile(TEST_PDF_URL);
                verify(fileStorageService, times(1)).storeFile(file, TEST_USER_ID);
                assertThat(testResume.getPdfUrl()).isEqualTo(NEW_PDF_URL);
            }
        }
    }

    @Nested
    @DisplayName("deleteMyResume 메서드")
    class DeleteMyResumeTest {

        @Test
        @DisplayName("성공: 이력서와 파일 모두 삭제")
        void deleteMyResume_Success() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(testResume));

            // when
            resumeServiceV2.deleteMyResume(TEST_USER_ID);

            // then
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
            verify(fileStorageService, times(1)).deleteFile(TEST_PDF_URL);
            verify(resumeRepository, times(1)).delete(testResume);
        }

        @Test
        @DisplayName("성공: 파일 삭제가 DB 삭제보다 먼저 실행")
        void deleteMyResume_CorrectOrder() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(testResume));

            // when
            resumeServiceV2.deleteMyResume(TEST_USER_ID);

            // then
            var inOrder = inOrder(fileStorageService, resumeRepository);
            inOrder.verify(fileStorageService).deleteFile(TEST_PDF_URL);
            inOrder.verify(resumeRepository).delete(testResume);
        }

        @Test
        @DisplayName("실패: 이력서가 없을 때 ResumeException 발생")
        void deleteMyResume_ResumeNotFound() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> resumeServiceV2.deleteMyResume(TEST_USER_ID))
                    .isInstanceOf(ResumeException.class);
            verify(resumeRepository, times(1))
                    .findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID);
            verify(fileStorageService, never()).deleteFile(anyString());
            verify(resumeRepository, never()).delete(any(Resume.class));
        }

        @Test
        @DisplayName("성공: 파일 삭제 실패해도 DB에서는 삭제")
        void deleteMyResume_FileDeleteFailureContinues() {
            // given
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(testResume));
            doNothing().when(fileStorageService).deleteFile(TEST_PDF_URL); // 예외 던지지 않음

            // when
            resumeServiceV2.deleteMyResume(TEST_USER_ID);

            // then
            verify(fileStorageService, times(1)).deleteFile(TEST_PDF_URL);
            verify(resumeRepository, times(1)).delete(testResume);
        }
    }

    @Nested
    @DisplayName("통합 시나리오 테스트")
    class IntegrationScenarioTest {

        @Test
        @DisplayName("시나리오: 업로드 → 조회 → 재업로드 → 삭제")
        void fullLifecycleScenario() {
            // 1. 최초 업로드
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(empty())
                    .willReturn(Optional.of(testResume));
            given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(TEST_PDF_URL);

            resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);
            verify(resumeRepository, times(1)).save(any(Resume.class));

            // 2. 조회
            ResumeResponseV2 response = resumeServiceV2.getMyResume(TEST_USER_ID);
            assertThat(response.pdfUrl()).isEqualTo(TEST_PDF_URL);

            // 3. 재업로드 (덮어쓰기)
            given(fileStorageService.storeFile(file, TEST_USER_ID)).willReturn(NEW_PDF_URL);
            resumeServiceV2.uploadOrUpdateResume(TEST_USER_ID, file);
            verify(fileStorageService, times(1)).deleteFile(TEST_PDF_URL);

            // 4. 삭제
            resumeServiceV2.deleteMyResume(TEST_USER_ID);
            verify(resumeRepository, times(1)).delete(testResume);
        }
    }

    @Nested
    @DisplayName("엣지 케이스 테스트")
    class EdgeCaseTest {

        @Test
        @DisplayName("성공: pdfUrl이 null인 경우에도 삭제 처리")
        void deleteFile_NullPdfUrl() {
            // given
            Resume resumeWithNullUrl = Resume.of(testUser, null);
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(resumeWithNullUrl));

            // when
            resumeServiceV2.deleteMyResume(TEST_USER_ID);

            // then
            verify(fileStorageService, times(1)).deleteFile(null);
            verify(resumeRepository, times(1)).delete(resumeWithNullUrl);
        }

        @Test
        @DisplayName("성공: pdfUrl이 빈 문자열인 경우에도 삭제 처리")
        void deleteFile_EmptyPdfUrl() {
            // given
            Resume resumeWithEmptyUrl = Resume.of(testUser, "");
            given(resumeRepository.findTopByUserIdOrderByUploadedAtDesc(TEST_USER_ID))
                    .willReturn(Optional.of(resumeWithEmptyUrl));

            // when
            resumeServiceV2.deleteMyResume(TEST_USER_ID);

            // then
            verify(fileStorageService, times(1)).deleteFile("");
            verify(resumeRepository, times(1)).delete(resumeWithEmptyUrl);
        }
    }
}
