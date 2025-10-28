package com.chub.service;

import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewRequestRequest;
import com.chub.dto.response.InterviewRequestResponse;
import com.chub.dto.response.ScheduledInterviewResponse;
import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.exception.interviewer.InterviewerProfileException;
import com.chub.exception.user.UserException;
import com.chub.repository.InterviewRequestRepository;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewRequestServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InterviewerProfileRepository interviewerProfileRepository;

    @Mock
    private InterviewRequestRepository interviewRequestRepository;

    @InjectMocks
    private InterviewRequestServiceImpl interviewRequestService;

    @Test
    @DisplayName("면접 신청 생성 성공")
    void createInterviewRequest_success() {
        // given
        Long userId = 1L;
        Long interviewerProfileId = 2L;
        String message = "면접 신청합니다.";

        User user = User.of("test-sub", "testuser");
        InterviewerProfile profile = mock(InterviewerProfile.class);

        CreateInterviewRequestRequest request = new CreateInterviewRequestRequest(interviewerProfileId, message);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(interviewerProfileRepository.findById(interviewerProfileId)).thenReturn(Optional.of(profile));
        when(interviewRequestRepository.findByUserIdAndInterviewerProfileIdAndStatusIn(
                eq(userId), eq(interviewerProfileId), anyList()
        )).thenReturn(Optional.empty());

        // when
        interviewRequestService.createInterviewRequest(userId, request);

        // then
        verify(interviewRequestRepository, times(1)).save(any(InterviewRequest.class));
    }

    @Test
    @DisplayName("면접 신청 생성 실패 - 사용자 없음")
    void createInterviewRequest_userNotFound() {
        // given
        Long userId = 1L;
        CreateInterviewRequestRequest request = new CreateInterviewRequestRequest(2L, "message");

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> interviewRequestService.createInterviewRequest(userId, request))
                .isInstanceOf(UserException.class);
    }

    @Test
    @DisplayName("면접 신청 생성 실패 - 면접관 프로필 없음")
    void createInterviewRequest_profileNotFound() {
        // given
        Long userId = 1L;
        Long interviewerProfileId = 2L;
        User user = User.of("test-sub", "testuser");

        CreateInterviewRequestRequest request = new CreateInterviewRequestRequest(interviewerProfileId, "message");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(interviewerProfileRepository.findById(interviewerProfileId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> interviewRequestService.createInterviewRequest(userId, request))
                .isInstanceOf(InterviewerProfileException.class);
    }

    @Test
    @DisplayName("면접 신청 생성 실패 - 중복 신청")
    void createInterviewRequest_duplicate() {
        // given
        Long userId = 1L;
        Long interviewerProfileId = 2L;
        User user = User.of("test-sub", "testuser");
        InterviewerProfile profile = mock(InterviewerProfile.class);
        InterviewRequest existingRequest = mock(InterviewRequest.class);

        CreateInterviewRequestRequest request = new CreateInterviewRequestRequest(interviewerProfileId, "message");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(interviewerProfileRepository.findById(interviewerProfileId)).thenReturn(Optional.of(profile));
        when(interviewRequestRepository.findByUserIdAndInterviewerProfileIdAndStatusIn(
                eq(userId), eq(interviewerProfileId), anyList()
        )).thenReturn(Optional.of(existingRequest));

        // when & then
        assertThatThrownBy(() -> interviewRequestService.createInterviewRequest(userId, request))
                .isInstanceOf(InterviewRequestException.class);
    }

    @Test
    @DisplayName("내가 보낸 면접 신청 목록 조회 성공")
    void getMyRequests_success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        User user = User.of("test-sub", "testuser");
        User interviewer = User.of("interviewer-sub", "interviewer");
        InterviewerProfile profile = mock(InterviewerProfile.class);
        when(profile.getId()).thenReturn(2L);
        when(profile.getUser()).thenReturn(interviewer);
        when(profile.getField()).thenReturn("Software Engineering");

        InterviewRequest request1 = InterviewRequest.of(user, profile, "message1");
        InterviewRequest request2 = InterviewRequest.of(user, profile, "message2");

        Page<InterviewRequest> requestPage = new PageImpl<>(Arrays.asList(request1, request2), pageable, 2);

        when(userRepository.existsById(userId)).thenReturn(true);
        when(interviewRequestRepository.findByUserId(userId, pageable)).thenReturn(requestPage);

        // when
        PageResponse<List<InterviewRequestResponse>> response = interviewRequestService.getMyRequests(userId, null, pageable);

        // then
        assertThat(response.data()).hasSize(2);
        assertThat(response.pageInfo().totalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("받은 면접 신청 목록 조회 성공 - PENDING만 조회")
    void getReceivedRequests_success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        User interviewer = User.of("interviewer-sub", "interviewer");
        User user1 = User.of("user1-sub", "user1");
        User user2 = User.of("user2-sub", "user2");

        InterviewerProfile profile = mock(InterviewerProfile.class);
        when(profile.getId()).thenReturn(2L);
        when(profile.getUser()).thenReturn(interviewer);
        when(profile.getField()).thenReturn("Software Engineering");

        InterviewRequest request1 = InterviewRequest.of(user1, profile, "message1");
        InterviewRequest request2 = InterviewRequest.of(user2, profile, "message2");

        Page<InterviewRequest> requestPage = new PageImpl<>(Arrays.asList(request1, request2), pageable, 2);

        when(interviewerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(interviewRequestRepository.findByInterviewerProfileIdAndStatus(2L, "PENDING", pageable))
                .thenReturn(requestPage);

        // when
        PageResponse<List<InterviewRequestResponse>> response = interviewRequestService.getReceivedRequests(userId, pageable);

        // then
        assertThat(response.data()).hasSize(2);
        assertThat(response.pageInfo().totalElements()).isEqualTo(2);
        verify(interviewRequestRepository, times(1))
                .findByInterviewerProfileIdAndStatus(2L, "PENDING", pageable);
    }

    @Test
    @DisplayName("면접 신청 상태 변경 성공 - 수락")
    void updateRequestStatus_approve() {
        // given
        Long requestId = 1L;
        Long userId = 2L;
        Boolean accepted = true;

        User interviewer = mock(User.class);
        User interviewee = mock(User.class);
        InterviewerProfile profile = mock(InterviewerProfile.class);
        when(profile.getUser()).thenReturn(interviewer);
        when(interviewer.getId()).thenReturn(userId);

        InterviewRequest request = mock(InterviewRequest.class);
        when(request.getInterviewerProfile()).thenReturn(profile);
        when(interviewRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

        // when
        interviewRequestService.updateRequestStatus(requestId, userId, accepted);

        // then
        verify(request, times(1)).approve();
    }

    @Test
    @DisplayName("면접 신청 상태 변경 실패 - 권한 없음")
    void updateRequestStatus_unauthorized() {
        // given
        Long requestId = 1L;
        Long userId = 999L;
        Boolean accepted = true;

        User interviewer = mock(User.class);
        InterviewerProfile profile = mock(InterviewerProfile.class);
        when(profile.getUser()).thenReturn(interviewer);
        when(interviewer.getId()).thenReturn(2L);

        InterviewRequest request = mock(InterviewRequest.class);
        when(request.getInterviewerProfile()).thenReturn(profile);
        when(interviewRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

        // when & then
        assertThatThrownBy(() -> interviewRequestService.updateRequestStatus(requestId, userId, accepted))
                .isInstanceOf(InterviewRequestException.class);
    }

    @Test
    @DisplayName("예정된 면접 목록 조회 성공")
    void getScheduledInterviews_success() {
        // given
        Long userId = 1L;

        User user = mock(User.class);
        User interviewer = mock(User.class);
        when(interviewer.getId()).thenReturn(2L);

        InterviewerProfile profile = mock(InterviewerProfile.class);
        when(profile.getUser()).thenReturn(interviewer);

        InterviewRequest request1 = mock(InterviewRequest.class);
        InterviewRequest request2 = mock(InterviewRequest.class);
        when(request1.getInterviewerProfile()).thenReturn(profile);
        when(request2.getInterviewerProfile()).thenReturn(profile);
        when(request1.getUser()).thenReturn(user);
        when(request2.getUser()).thenReturn(user);

        when(userRepository.existsById(userId)).thenReturn(true);
        when(interviewRequestRepository.findScheduledInterviewsByUserId(userId, "APPROVED"))
                .thenReturn(Arrays.asList(request1, request2));

        // when
        List<ScheduledInterviewResponse> responses = interviewRequestService.getScheduledInterviews(userId);

        // then
        assertThat(responses).hasSize(2);
    }
}
