package com.chub.interviewroom.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.repository.InterviewRequestRepository;
import com.chub.websocket.util.WebSocketHelper;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InterviewRoomServiceTest {

    @Mock
    private InterviewRoomManager interviewRoomManager;

    @Mock
    private InterviewRequestRepository interviewRequestRepository;

    @Mock
    private WebSocketHelper webSocketHelper;

    @InjectMocks
    private InterviewRoomServiceImpl interviewRoomService;

    private static final Long USER_ID = 1L;
    private static final Long INTERVIEWER_ID = 2L;
    private static final Long INTERVIEW_REQUEST_ID = 100L;

    @Test
    void joinRoom_Success() {
        // given
        InterviewRequest interviewRequest = createApprovedInterviewRequest();
        when(interviewRequestRepository.findById(INTERVIEW_REQUEST_ID))
                .thenReturn(Optional.of(interviewRequest));

        // when
        interviewRoomService.joinRoom(USER_ID, INTERVIEW_REQUEST_ID);

        // then
        verify(interviewRequestRepository, times(1)).findById(eq(INTERVIEW_REQUEST_ID));
        verify(interviewRoomManager, times(1)).joinRoom(
                eq(USER_ID),
                eq(INTERVIEW_REQUEST_ID),
                any(InterviewRoomState.class)
        );
    }

    @Test
    void joinRoom_InterviewRequestNotFound_ThrowsException() {
        // given
        when(interviewRequestRepository.findById(INTERVIEW_REQUEST_ID))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() ->
                interviewRoomService.joinRoom(USER_ID, INTERVIEW_REQUEST_ID)
        ).isInstanceOf(InterviewRequestException.class);

        verify(interviewRequestRepository, times(1)).findById(eq(INTERVIEW_REQUEST_ID));
        verify(interviewRoomManager, times(0)).joinRoom(any(), any(), any());
    }

    @Test
    void joinRoom_NotApproved_ThrowsException() {
        // given
        InterviewRequest interviewRequest = createPendingInterviewRequest();
        when(interviewRequestRepository.findById(INTERVIEW_REQUEST_ID))
                .thenReturn(Optional.of(interviewRequest));

        // when & then
        assertThatThrownBy(() ->
                interviewRoomService.joinRoom(USER_ID, INTERVIEW_REQUEST_ID)
        ).isInstanceOf(InterviewRequestException.class);

        verify(interviewRequestRepository, times(1)).findById(eq(INTERVIEW_REQUEST_ID));
        verify(interviewRoomManager, times(0)).joinRoom(any(), any(), any());
    }

    @Test
    void joinRoom_RejectedStatus_ThrowsException() {
        // given
        InterviewRequest interviewRequest = createRejectedInterviewRequest();
        when(interviewRequestRepository.findById(INTERVIEW_REQUEST_ID))
                .thenReturn(Optional.of(interviewRequest));

        // when & then
        assertThatThrownBy(() ->
                interviewRoomService.joinRoom(USER_ID, INTERVIEW_REQUEST_ID)
        ).isInstanceOf(InterviewRequestException.class);

        verify(interviewRequestRepository, times(1)).findById(eq(INTERVIEW_REQUEST_ID));
        verify(interviewRoomManager, times(0)).joinRoom(any(), any(), any());
    }

    @Test
    void exitRoom_Success() {
        // when
        interviewRoomService.exitRoom(USER_ID, INTERVIEW_REQUEST_ID);

        // then
        verify(interviewRoomManager, times(1)).exitRoom(
                eq(USER_ID),
                eq(INTERVIEW_REQUEST_ID)
        );
    }

    private InterviewRequest createApprovedInterviewRequest() {
        User interviewee = createUser(USER_ID);
        User interviewer = createUser(INTERVIEWER_ID);
        InterviewerProfile interviewerProfile = createInterviewerProfile(interviewer);

        InterviewRequest request = InterviewRequest.builder()
                .user(interviewee)
                .interviewerProfile(interviewerProfile)
                .message("Test message")
                .build();

        request.approve();
        return request;
    }

    private InterviewRequest createPendingInterviewRequest() {
        User interviewee = createUser(USER_ID);
        User interviewer = createUser(INTERVIEWER_ID);
        InterviewerProfile interviewerProfile = createInterviewerProfile(interviewer);

        return InterviewRequest.builder()
                .user(interviewee)
                .interviewerProfile(interviewerProfile)
                .message("Test message")
                .build();
    }

    private InterviewRequest createRejectedInterviewRequest() {
        User interviewee = createUser(USER_ID);
        User interviewer = createUser(INTERVIEWER_ID);
        InterviewerProfile interviewerProfile = createInterviewerProfile(interviewer);

        InterviewRequest request = InterviewRequest.builder()
                .user(interviewee)
                .interviewerProfile(interviewerProfile)
                .message("Test message")
                .build();

        request.reject();
        return request;
    }

    private User createUser(Long userId) {
        User user = User.builder()
                .sub("test-sub-" + userId)
                .username("TestUser" + userId)
                .build();
        return user;
    }

    private InterviewerProfile createInterviewerProfile(User user) {
        InterviewerProfile profile = InterviewerProfile.builder()
                .user(user)
                .company("Test Company")
                .position("Test Position")
                .build();
        profile.updateIntroduction("Test introduction");
        return profile;
    }
}
