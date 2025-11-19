package com.chub.interviewroom.service;

import static com.chub.exception.interview.InterviewRequestException.invalidStatus;
import static com.chub.interviewroom.enums.InterviewRoomChatType.SYSTEM;
import static com.chub.interviewroom.enums.InterviewRoomChatType.USER;

import com.chub.entity.InterviewRequest;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.domain.Participants;
import com.chub.interviewroom.dto.JoinRoomDto;
import com.chub.interviewroom.dto.OpponentDto;
import com.chub.interviewroom.enums.RoomStatus;
import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.repository.InterviewRequestRepository;
import com.chub.websocket.util.WebSocketHelper;
import java.time.LocalDateTime;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewRoomServiceImpl implements InterviewRoomService {

    private final InterviewRoomManager interviewRoomManager;
    private final InterviewRequestRepository interviewRequestRepository;
    private final WebSocketHelper webSocketHelper;
    private final com.chub.Interview.manager.InterviewManager interviewManager;

    private static final String APPROVED = "APPROVED";
    private static final String INTERVIEW_PREFIX = "/interview/";

    @Override
    public JoinRoomDto joinRoom(Long userId, Long interviewRequestId) {
        // 비즈니스 로직: DB 조회 및 검증
        InterviewRequest interviewRequest = getInterviewRequest(interviewRequestId);
        validateApproved(interviewRequest);

        // 비즈니스 로직: 방 상태 생성
        InterviewRoomState roomState = createRoomState(interviewRequestId, interviewRequest);

        // 상태 관리: Manager에 위임
        roomState = interviewRoomManager.joinRoom(userId, interviewRequestId, roomState);

        sendJoinEvent(userId, interviewRequestId);

        OpponentDto opponent = createOpponentDto(userId, interviewRequest);

        String currentQuestion = interviewManager.getLastQuestion(interviewRequestId).orElse(null);

        return JoinRoomDto.of(userId, roomState, opponent, currentQuestion);
    }

    @Override
    public void exitRoom(Long userId, Long interviewRequestId) {

        interviewRoomManager.exitRoom(userId, interviewRequestId);

        sendLeaveEvent(userId, interviewRequestId);
    }

    @Override
    public void sendUserChat(Long userId, Long interviewRequestId, InterviewRoomChatMessage message) {

        validateUserInRoom(userId, interviewRequestId);

        InterviewRoomChatMessage filledMessage = fillMessage(userId, interviewRequestId, message);

        sendChat(interviewRequestId, filledMessage);
    }

    private InterviewRequest getInterviewRequest(Long interviewRequestId) {
        return interviewRequestRepository.findById(interviewRequestId)
                .orElseThrow(InterviewRequestException::notFound);
    }

    private void validateApproved(InterviewRequest interviewRequest) {
        if (!interviewRequest.getStatus().equals(APPROVED)) {
            throw invalidStatus();
        }
    }

    private InterviewRoomState createRoomState(Long interviewRequestId, InterviewRequest interviewRequest) {
        Participants participants = new Participants(
                interviewRequest.getInterviewerProfile().getUser().getId(),
                interviewRequest.getInterviewerProfile().getUser().getUsername(),
                interviewRequest.getUser().getId(),
                interviewRequest.getUser().getUsername()
        );

        return InterviewRoomState.builder()
                .interviewRequestId(interviewRequestId)
                .participants(participants)
                .chatHistory(new ArrayList<>())
                .status(RoomStatus.WAITING)
                .startTime(null)
                .build();
    }

    private void sendChat(Long interviewRequestId, InterviewRoomChatMessage message) {

        webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + interviewRequestId,
                "chat-received", message
        );

        interviewRoomManager.addChatMessage(interviewRequestId, message);
    }

    private void validateUserInRoom(Long userId, Long interviewRequestId) {
        if (!interviewRoomManager.isUserInRoom(userId, interviewRequestId)) {
            throw InterviewRequestException.invalidStatus();
        }
    }

    private InterviewRoomChatMessage fillMessage(Long userId, Long interviewRequestId,
                                                 InterviewRoomChatMessage message) {

        String senderNickname = interviewRoomManager.getNickname(userId);
        Long receiverId = interviewRoomManager.getOpponentId(userId);
        String receiverNickname = interviewRoomManager.getNickname(receiverId);

        message.setType(USER);
        message.setSenderId(userId);
        message.setSenderNickname(senderNickname);
        message.setReceiverId(receiverId);
        message.setReceiverNickname(receiverNickname);
        message.setCreatedAt(LocalDateTime.now());

        return message;
    }

    private void sendJoinEvent(Long userId, Long interviewRequestId) {

        webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + interviewRequestId,
                "user-joined", null
        );

        InterviewRoomChatMessage chatMessage = InterviewRoomChatMessage.builder()
                .type(SYSTEM)
                .message(interviewRoomManager.getNickname(userId) + " 님이 입장했습니다.")
                .createdAt(LocalDateTime.now())
                .build();

        sendChat(interviewRequestId, chatMessage);
    }

    private void sendLeaveEvent(Long userId, Long interviewRequestId) {

        webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + interviewRequestId,
                "user-left", null
        );

        InterviewRoomChatMessage chatMessage = InterviewRoomChatMessage.builder()
                .type(SYSTEM)
                .message(interviewRoomManager.getNickname(userId) + " 님이 퇴장했습니다.")
                .createdAt(LocalDateTime.now())
                .build();

        sendChat(interviewRequestId, chatMessage);
    }

    private OpponentDto createOpponentDto(Long userId, InterviewRequest interviewRequest) {

        boolean isInterviewer = userId.equals(interviewRequest.getInterviewerProfile().getUser().getId());

        if (isInterviewer) {
            // 면접관이 접속 -> opponent는 면접자
            return OpponentDto.builder()
                    .id(interviewRequest.getUser().getId())
                    .name(interviewRequest.getUser().getUsername())
                    .avatar(interviewRequest.getUser().getAvatarUrl())
                    .build();
        } else {
            // 면접자가 접속 -> opponent는 면접관
            return OpponentDto.builder()
                    .id(interviewRequest.getInterviewerProfile().getUser().getId())
                    .name(interviewRequest.getInterviewerProfile().getUser().getUsername())
                    .avatar(interviewRequest.getInterviewerProfile().getUser().getAvatarUrl())
                    .build();
        }
    }
}
