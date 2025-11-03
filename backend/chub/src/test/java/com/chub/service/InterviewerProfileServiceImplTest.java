package com.chub.service;

import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.request.CreateInterviewerProfileRequest.ExperienceDto;
import com.chub.dto.response.InterviewerProfileListData;
import com.chub.dto.response.InterviewerProfileResponse;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.exception.interviewer.InterviewerProfileException;
import com.chub.exception.user.UserException;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static java.util.Collections.emptyList;
import static java.util.Optional.empty;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InterviewerProfileServiceImpl 단위 테스트")
class InterviewerProfileServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InterviewerProfileRepository interviewerProfileRepository;

    @InjectMocks
    private InterviewerProfileServiceImpl interviewerProfileService;

    private User testUser;
    private InterviewerProfile testProfile;
    private CreateInterviewerProfileRequest testRequest;

    private static final Long TEST_USER_ID = 1L;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_FIELD = "소프트웨어 엔지니어링";
    private static final String TEST_COMPANY = "네이버";
    private static final String TEST_POSITION = "시니어 개발자";
    private static final String TEST_BIO = "10년 경력의 백엔드 개발자입니다.";
    private static final Integer TEST_PRICE = 80000;

    @BeforeEach
    void setUp() {
        testUser = User.of("test-sub-123", "김민준");
        testProfile = InterviewerProfile.of(testUser, TEST_COMPANY, TEST_POSITION);
        testProfile.updateEmail(TEST_EMAIL);
        testProfile.updateField(TEST_FIELD);
        testProfile.updatePrice(TEST_PRICE);
        testProfile.updateIntroduction(TEST_BIO);

        testRequest = new CreateInterviewerProfileRequest(
                "김민준",
                TEST_EMAIL,
                "https://example.com/avatar.jpg",
                TEST_FIELD,
                TEST_COMPANY,
                TEST_POSITION,
                TEST_BIO,
                emptyList(),
                List.of("Java", "Spring Boot"),
                emptyList(),
                emptyList(),
                List.of("한국어", "영어"),
                "실무 중심의 문제 해결 능력을 평가합니다.",
                List.of("평일 오후 7시-10시"),
                TEST_PRICE
        );
    }

    @Nested
    @DisplayName("getMyProfile 메서드")
    class GetMyProfileTest {

        @Test
        @DisplayName("성공: 면접관 프로필 조회")
        void getMyProfile_Success() {
            // given
            given(userRepository.findById(TEST_USER_ID))
                    .willReturn(Optional.of(testUser));
            given(interviewerProfileRepository.findByUserId(TEST_USER_ID))
                    .willReturn(Optional.of(testProfile));

            // when
            InterviewerProfileResponse response = interviewerProfileService.getMyProfile(TEST_USER_ID);

            // then
            assertThat(response).isNotNull();
            assertThat(response.email()).isEqualTo(TEST_EMAIL);
            assertThat(response.field()).isEqualTo(TEST_FIELD);
            assertThat(response.company()).isEqualTo(TEST_COMPANY);
            assertThat(response.position()).isEqualTo(TEST_POSITION);
            assertThat(response.price()).isEqualTo(TEST_PRICE);
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(interviewerProfileRepository, times(1)).findByUserId(TEST_USER_ID);
        }

        @Test
        @DisplayName("실패: 사용자가 존재하지 않을 때 UserException 발생")
        void getMyProfile_UserNotFound() {
            // given
            given(userRepository.findById(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> interviewerProfileService.getMyProfile(TEST_USER_ID))
                    .isInstanceOf(UserException.class);
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(interviewerProfileRepository, never()).findByUserId(any());
        }

        @Test
        @DisplayName("실패: 면접관 프로필이 없을 때 InterviewerProfileException 발생")
        void getMyProfile_ProfileNotFound() {
            // given
            given(userRepository.findById(TEST_USER_ID))
                    .willReturn(Optional.of(testUser));
            given(interviewerProfileRepository.findByUserId(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> interviewerProfileService.getMyProfile(TEST_USER_ID))
                    .isInstanceOf(InterviewerProfileException.class);
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(interviewerProfileRepository, times(1)).findByUserId(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("createProfile 메서드")
    class CreateProfileTest {

        private void givenProfileDoesNotExist() {
            given(interviewerProfileRepository.existsByUserId(TEST_USER_ID))
                    .willReturn(false);
            given(userRepository.findById(TEST_USER_ID))
                    .willReturn(Optional.of(testUser));
        }

        private void verifyProfileCreated() {
            verify(interviewerProfileRepository, times(1)).existsByUserId(TEST_USER_ID);
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(interviewerProfileRepository, times(1)).save(any(InterviewerProfile.class));
        }

        private ExperienceDto createExperience(
                String company, Integer startYear, String endYear, String role) {
            return new ExperienceDto(company, startYear, endYear, role);
        }

        @Test
        @DisplayName("성공: 면접관 프로필 생성")
        void createProfile_Success() {
            // given
            givenProfileDoesNotExist();

            // when
            interviewerProfileService.createProfile(TEST_USER_ID, testRequest);

            // then
            verifyProfileCreated();
        }

        @Test
        @DisplayName("실패: 이미 프로필이 존재할 때 InterviewerProfileException 발생")
        void createProfile_AlreadyExists() {
            // given
            given(interviewerProfileRepository.existsByUserId(TEST_USER_ID))
                    .willReturn(true);

            // when & then
            assertThatThrownBy(() -> interviewerProfileService.createProfile(TEST_USER_ID, testRequest))
                    .isInstanceOf(InterviewerProfileException.class);
            verify(interviewerProfileRepository, times(1)).existsByUserId(TEST_USER_ID);
            verify(userRepository, never()).findById(any());
            verify(interviewerProfileRepository, never()).save(any(InterviewerProfile.class));
        }

        @Test
        @DisplayName("실패: 사용자가 존재하지 않을 때 UserException 발생")
        void createProfile_UserNotFound() {
            // given
            given(interviewerProfileRepository.existsByUserId(TEST_USER_ID))
                    .willReturn(false);
            given(userRepository.findById(TEST_USER_ID))
                    .willReturn(empty());

            // when & then
            assertThatThrownBy(() -> interviewerProfileService.createProfile(TEST_USER_ID, testRequest))
                    .isInstanceOf(UserException.class);
            verify(interviewerProfileRepository, times(1)).existsByUserId(TEST_USER_ID);
            verify(userRepository, times(1)).findById(TEST_USER_ID);
            verify(interviewerProfileRepository, never()).save(any(InterviewerProfile.class));
        }

        @Test
        @DisplayName("성공: null 값이 포함된 프로필 생성")
        void createProfile_WithNullValues() {
            // given
            CreateInterviewerProfileRequest requestWithNulls = new CreateInterviewerProfileRequest(
                    "김민준",
                    TEST_EMAIL,
                    null, // avatar null
                    TEST_FIELD,
                    null, // company null
                    null, // position null
                    null, // bio null
                    null, // experiences null
                    null, // specialties null
                    null, // education null
                    null, // certifications null
                    null, // languages null
                    null, // interviewStyle null
                    null, // availableTimeSlots null
                    TEST_PRICE
            );
            givenProfileDoesNotExist();

            // when
            interviewerProfileService.createProfile(TEST_USER_ID, requestWithNulls);

            // then
            verifyProfileCreated();
        }

        @Test
        @DisplayName("성공: 빈 리스트가 포함된 프로필 생성")
        void createProfile_WithEmptyLists() {
            // given
            CreateInterviewerProfileRequest requestWithEmptyLists = new CreateInterviewerProfileRequest(
                    "김민준",
                    TEST_EMAIL,
                    "https://example.com/avatar.jpg",
                    TEST_FIELD,
                    TEST_COMPANY,
                    TEST_POSITION,
                    TEST_BIO,
                    emptyList(),
                    emptyList(),
                    emptyList(),
                    emptyList(),
                    emptyList(),
                    "실무 중심",
                    emptyList(),
                    TEST_PRICE
            );
            givenProfileDoesNotExist();

            // when
            interviewerProfileService.createProfile(TEST_USER_ID, requestWithEmptyLists);

            // then
            verifyProfileCreated();
        }

        @Test
        @DisplayName("성공: 경력 정보가 포함된 프로필 생성")
        void createProfile_WithExperiences() {
            // given
            ExperienceDto experience1 =
                    createExperience("네이버", 2020, "재직중", "백엔드 개발자");
            ExperienceDto experience2 =
                    createExperience("카카오", 2018, "2020", "주니어 개발자");

            CreateInterviewerProfileRequest requestWithExperiences = new CreateInterviewerProfileRequest(
                    "김민준",
                    TEST_EMAIL,
                    "https://example.com/avatar.jpg",
                    TEST_FIELD,
                    TEST_COMPANY,
                    TEST_POSITION,
                    TEST_BIO,
                    List.of(experience1, experience2),
                    List.of("Java", "Spring"),
                    emptyList(),
                    emptyList(),
                    List.of("한국어"),
                    "실무 중심",
                    List.of("평일 오후"),
                    TEST_PRICE
            );
            givenProfileDoesNotExist();

            // when
            interviewerProfileService.createProfile(TEST_USER_ID, requestWithExperiences);

            // then
            verifyProfileCreated();
        }
    }

    @Nested
    @DisplayName("getInterviewerProfiles 메서드")
    class GetInterviewerProfilesTest {

        @Test
        @DisplayName("성공: 면접관 목록 조회")
        void getInterviewerProfiles_Success() {
            // given
            Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<InterviewerProfile> profilePage = new PageImpl<>(List.of(testProfile));
            given(interviewerProfileRepository.findAll(any(Pageable.class)))
                    .willReturn(profilePage);

            // when
            PageResponse<InterviewerProfileListData> response =
                    interviewerProfileService.getInterviewerProfiles(null, 0, 10);

            // then
            assertThat(response).isNotNull();
            assertThat(response.data().profiles()).hasSize(1);
            assertThat(response.pageInfo().totalElements()).isEqualTo(1);
            verify(interviewerProfileRepository, times(1)).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("getInterviewerProfileById 메서드")
    class GetInterviewerProfileByIdTest {

        @Test
        @DisplayName("성공: 면접관 프로필 상세 조회")
        void getInterviewerProfileById_Success() {
            // given
            given(interviewerProfileRepository.findById(1L))
                    .willReturn(Optional.of(testProfile));

            // when
            InterviewerProfileResponse response =
                    interviewerProfileService.getInterviewerProfileById(1L);

            // then
            assertThat(response).isNotNull();
            assertThat(response.field()).isEqualTo(TEST_FIELD);
            assertThat(response.company()).isEqualTo(TEST_COMPANY);
            verify(interviewerProfileRepository, times(1)).findById(1L);
        }
    }
}
