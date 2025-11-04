package com.chub.service;

import com.chub.dto.request.UserProfileUpdateRequest;
import com.chub.entity.User;
import com.chub.exception.user.UserException;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 단위 테스트")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private static final Long TEST_USER_ID = 1L;
    private static final String TEST_SUB = "kakao_12345";
    private static final String TEST_USERNAME = "홍길동";
    private static final String TEST_EMAIL = "hong@example.com";
    private static final String TEST_BIO = "백엔드 개발자입니다";
    private static final String TEST_AVATAR_URL = "https://example.com/avatar.jpg";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .sub(TEST_SUB)
                .username(TEST_USERNAME)
                .build();
        org.springframework.test.util.ReflectionTestUtils.setField(testUser, "id", TEST_USER_ID);
    }

    @Nested
    @DisplayName("updateUserProfile 메서드")
    class UpdateUserProfileTest {

        @Test
        @DisplayName("성공: 모든 필드 업데이트")
        void updateUserProfile_AllFields() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    "김철수",
                    TEST_EMAIL,
                    TEST_BIO
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo("김철수");
            assertThat(updatedUser.getEmail()).isEqualTo(TEST_EMAIL);
            assertThat(updatedUser.getBio()).isEqualTo(TEST_BIO);
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("성공: username만 업데이트")
        void updateUserProfile_OnlyUsername() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    "김철수",
                    null,
                    null
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo("김철수");
            assertThat(updatedUser.getEmail()).isNull();
            assertThat(updatedUser.getBio()).isNull();
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("성공: email만 업데이트")
        void updateUserProfile_OnlyEmail() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    null,
                    TEST_EMAIL,
                    null
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo(TEST_USERNAME);
            assertThat(updatedUser.getEmail()).isEqualTo(TEST_EMAIL);
            assertThat(updatedUser.getBio()).isNull();
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("성공: bio만 업데이트")
        void updateUserProfile_OnlyBio() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    null,
                    null,
                    TEST_BIO
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo(TEST_USERNAME);
            assertThat(updatedUser.getEmail()).isNull();
            assertThat(updatedUser.getBio()).isEqualTo(TEST_BIO);
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("성공: 아무 필드도 업데이트하지 않음 (모두 null)")
        void updateUserProfile_NoFields() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    null,
                    null,
                    null
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo(TEST_USERNAME);
            assertThat(updatedUser.getEmail()).isNull();
            assertThat(updatedUser.getBio()).isNull();
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("성공: 기존 값이 있을 때 부분 업데이트")
        void updateUserProfile_PartialUpdateWithExistingValues() {
            // given
            testUser.updateEmail("old@example.com");
            testUser.updateBio("기존 소개");

            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    "새이름",
                    null,  // email은 업데이트하지 않음
                    "새 소개"
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);

            // when
            User updatedUser = userService.updateUserProfile(TEST_USER_ID, request);

            // then
            assertThat(updatedUser.getUsername()).isEqualTo("새이름");
            assertThat(updatedUser.getEmail()).isEqualTo("old@example.com");
            assertThat(updatedUser.getBio()).isEqualTo("새 소개");
            verify(userRepository).findById(TEST_USER_ID);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("실패: 존재하지 않는 사용자 ID로 업데이트 시도")
        void updateUserProfile_UserNotFound() {
            // given
            UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                    "김철수",
                    TEST_EMAIL,
                    TEST_BIO
            );

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> userService.updateUserProfile(TEST_USER_ID, request))
                    .isInstanceOf(UserException.class);
            verify(userRepository).findById(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("findById 메서드")
    class FindByIdTest {

        @Test
        @DisplayName("성공: 사용자 조회")
        void findById_Success() {
            // given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // when
            User foundUser = userService.findById(TEST_USER_ID);

            // then
            assertThat(foundUser).isNotNull();
            assertThat(foundUser.getId()).isEqualTo(TEST_USER_ID);
            assertThat(foundUser.getUsername()).isEqualTo(TEST_USERNAME);
            verify(userRepository).findById(TEST_USER_ID);
        }

        @Test
        @DisplayName("실패: 존재하지 않는 사용자 조회")
        void findById_UserNotFound() {
            // given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> userService.findById(TEST_USER_ID))
                    .isInstanceOf(UserException.class);
            verify(userRepository).findById(TEST_USER_ID);
        }
    }
}
