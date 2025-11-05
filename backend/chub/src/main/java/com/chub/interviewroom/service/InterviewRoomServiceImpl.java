package com.chub.interviewroom.service;

import static com.chub.exception.interview.InterviewRequestException.invalidStatus;

import com.chub.entity.InterviewRequest;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.domain.Participants;
import com.chub.interviewroom.enums.RoomStatus;
import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.repository.InterviewRequestRepository;
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

    private static final String APPROVED = "APPROVED";

    @Override
    public void joinRoom(Long userId, Long interviewRequestId) {
        // 비즈니스 로직: DB 조회 및 검증
        InterviewRequest interviewRequest = getInterviewRequest(interviewRequestId);
        validateApproved(interviewRequest);

        // 비즈니스 로직: 방 상태 생성
        InterviewRoomState roomState = createRoomState(interviewRequestId, interviewRequest);

        // 상태 관리: Manager에 위임
        interviewRoomManager.joinRoom(userId, interviewRequestId, roomState);
    }

    @Override
    public void exitRoom(Long userId, Long interviewRequestId) {
        interviewRoomManager.exitRoom(userId, interviewRequestId);
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
                interviewRequest.getUser().getId()
        );

        return InterviewRoomState.builder()
                .interviewRequestId(interviewRequestId)
                .participants(participants)
                .chatHistory(new ArrayList<>())
                .status(RoomStatus.WAITING)
                .startTime(null)
                .build();
    }
}
