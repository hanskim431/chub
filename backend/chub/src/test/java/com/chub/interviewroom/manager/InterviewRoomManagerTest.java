package com.chub.interviewroom.manager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.domain.Participants;
import com.chub.interviewroom.enums.RoomStatus;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InterviewRoomManagerTest {

    private InterviewRoomManager interviewRoomManager;

    private static final Long INTERVIEWER_ID = 1L;
    private static final Long INTERVIEWEE_ID = 2L;
    private static final Long INTERVIEW_REQUEST_ID = 100L;
    private static final String INTERVIEWER_NICKNAME = "interviewer";
    private static final String INTERVIEWEE_NICKNAME = "interviewee";

    @BeforeEach
    void setUp() {
        interviewRoomManager = new InterviewRoomManager();
    }

    @Test
    void joinRoom_Success() {
        // given
        InterviewRoomState roomState = createRoomState();

        // when
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState);

        // then
        Long opponentId = interviewRoomManager.getOpponentId(INTERVIEWER_ID);
        assertThat(opponentId).isEqualTo(INTERVIEWEE_ID);
    }

    @Test
    void joinRoom_BothParticipantsJoin_Success() {
        // given
        InterviewRoomState roomState = createRoomState();

        // when
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState);
        interviewRoomManager.joinRoom(INTERVIEWEE_ID, INTERVIEW_REQUEST_ID, roomState);

        // then
        Long interviewerOpponentId = interviewRoomManager.getOpponentId(INTERVIEWER_ID);
        Long intervieweeOpponentId = interviewRoomManager.getOpponentId(INTERVIEWEE_ID);

        assertThat(interviewerOpponentId).isEqualTo(INTERVIEWEE_ID);
        assertThat(intervieweeOpponentId).isEqualTo(INTERVIEWER_ID);
    }

    @Test
    void joinRoom_UnauthorizedUser_ThrowsException() {
        // given
        InterviewRoomState roomState = createRoomState();
        Long unauthorizedUserId = 999L;

        // when & then
        assertThatThrownBy(() ->
                interviewRoomManager.joinRoom(unauthorizedUserId, INTERVIEW_REQUEST_ID, roomState)
        ).isInstanceOf(InterviewRequestException.class);
    }

    @Test
    void exitRoom_RemovesUserFromRoom() {
        // given
        InterviewRoomState roomState = createRoomState();
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState);

        // when
        interviewRoomManager.exitRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID);

        // then
        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(INTERVIEWER_ID)
        ).isInstanceOf(InterviewRequestException.class);
    }

    @Test
    void exitRoom_BothUsersExit_RemovesRoom() {
        // given
        InterviewRoomState roomState = createRoomState();
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState);
        interviewRoomManager.joinRoom(INTERVIEWEE_ID, INTERVIEW_REQUEST_ID, roomState);

        // when
        interviewRoomManager.exitRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID);
        interviewRoomManager.exitRoom(INTERVIEWEE_ID, INTERVIEW_REQUEST_ID);

        // then
        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(INTERVIEWER_ID)
        ).isInstanceOf(InterviewRequestException.class);

        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(INTERVIEWEE_ID)
        ).isInstanceOf(InterviewRequestException.class);
    }

    @Test
    void removeRoom_RemovesAllParticipants() {
        // given
        InterviewRoomState roomState = createRoomState();
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState);
        interviewRoomManager.joinRoom(INTERVIEWEE_ID, INTERVIEW_REQUEST_ID, roomState);

        // when
        interviewRoomManager.removeRoom(INTERVIEW_REQUEST_ID);

        // then
        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(INTERVIEWER_ID)
        ).isInstanceOf(InterviewRequestException.class);

        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(INTERVIEWEE_ID)
        ).isInstanceOf(InterviewRequestException.class);
    }

    @Test
    void getOpponentId_NotJoined_ThrowsException() {
        // given
        Long notJoinedUserId = 999L;

        // when & then
        assertThatThrownBy(() ->
                interviewRoomManager.getOpponentId(notJoinedUserId)
        ).isInstanceOf(InterviewRequestException.class);
    }

    @Test
    void joinRoom_SwitchRoom_AutomaticallyExitsPreviousRoom() {
        // given
        InterviewRoomState roomState1 = createRoomState();
        InterviewRoomState roomState2 = InterviewRoomState.builder()
                .interviewRequestId(200L)
                .participants(new Participants(INTERVIEWER_ID, INTERVIEWER_NICKNAME,
                                               3L, "anotherInterviewee"))
                .chatHistory(new ArrayList<>())
                .status(RoomStatus.WAITING)
                .startTime(null)
                .build();

        // when
        interviewRoomManager.joinRoom(INTERVIEWER_ID, INTERVIEW_REQUEST_ID, roomState1);
        interviewRoomManager.joinRoom(INTERVIEWER_ID, 200L, roomState2);

        // then
        Long opponentId = interviewRoomManager.getOpponentId(INTERVIEWER_ID);
        assertThat(opponentId).isEqualTo(3L);
    }

    private InterviewRoomState createRoomState() {
        return InterviewRoomState.builder()
                .interviewRequestId(INTERVIEW_REQUEST_ID)
                .participants(new Participants(INTERVIEWER_ID, INTERVIEWER_NICKNAME,
                                               INTERVIEWEE_ID, INTERVIEWEE_NICKNAME))
                .chatHistory(new ArrayList<>())
                .status(RoomStatus.WAITING)
                .startTime(null)
                .build();
    }
}
