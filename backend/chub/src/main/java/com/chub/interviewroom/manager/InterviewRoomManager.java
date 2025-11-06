package com.chub.interviewroom.manager;

import static com.chub.exception.interview.InterviewRequestException.unauthorizedAccess;
import static com.chub.interviewroom.enums.RoomStatus.READY;
import static com.chub.interviewroom.enums.RoomStatus.WAITING;
import static java.util.Optional.ofNullable;

import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.domain.Participants;
import com.chub.interviewroom.enums.RoomStatus;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class InterviewRoomManager {

    private final Map<Long, InterviewRoomState> interviewRoomInfo = new ConcurrentHashMap<>();
    private final Map<Long, Long> joinedRoom = new ConcurrentHashMap<>();

    public void joinRoom(Long userId, Long interviewRequestId, InterviewRoomState roomState) {
        // 상태 관리: 방 정보 저장
        interviewRoomInfo.putIfAbsent(interviewRequestId, roomState);

        // 상태 관리: 참가자 검증 및 입장
        joinRoomIfParticipate(userId, interviewRequestId);
    }

    public void exitRoom(Long userId, Long interviewRequestId) {

        joinedRoom.remove(userId);

        updateRoomStatus(interviewRequestId, WAITING);

        removeRoomIfBothExit(interviewRequestId);
    }

    public void removeRoom(Long interviewRequestId) {
        interviewRoomInfo.computeIfPresent(interviewRequestId, (id, interviewRoomState) -> {

            removeParticipants(interviewRoomState);

            return null;
        });
    }

    public Long getOpponentId(Long userId) {
        Long interviewRequestId = ofNullable(joinedRoom.get(userId))
                .orElseThrow(InterviewRequestException::notFound);

        return interviewRoomInfo.get(interviewRequestId).getParticipants().getOpponentId(userId);
    }

    public void updateRoomStatus(Long interviewRequestId, RoomStatus newStatus) {
        InterviewRoomState roomState = ofNullable(interviewRoomInfo.get(interviewRequestId))
                .orElseThrow(InterviewRequestException::notFound);

        roomState.changeStatus(newStatus);
    }

    private void removeRoomIfBothExit(Long interviewRequestId) {
        interviewRoomInfo.computeIfPresent(interviewRequestId, (id, interviewRoomState) -> {

            Participants p = interviewRoomState.getParticipants();

            if (interviewRequestId.equals(joinedRoom.get(p.interviewerId())) ||
                    interviewRequestId.equals(joinedRoom.get(p.intervieweeId()))) {
                return interviewRoomState;
            }

            return null;
        });
    }

    private void removeParticipants(InterviewRoomState interviewRoomState) {

        Participants participants = interviewRoomState.getParticipants();
        Long interviewRequestId = interviewRoomState.getInterviewRequestId();

        participants.toList().forEach(id -> {
            joinedRoom.computeIfPresent(id, (userId, requestId) -> {
                if (requestId.equals(interviewRequestId)) {
                    return null;
                }
                return requestId;
            });
        });
    }

    private void joinRoomIfParticipate(Long userId, Long interviewRequestId) {
        if (!interviewRoomInfo.get(interviewRequestId).getParticipants().contains(userId)) {
            removeRoomIfBothExit(interviewRequestId);
            throw unauthorizedAccess();
        }

        Long currentRoomId = joinedRoom.get(userId);

        if (interviewRequestId.equals(currentRoomId)) {
            return;
        }

        ofNullable(currentRoomId).ifPresent(roomId -> exitRoom(userId, roomId));

        joinedRoom.put(userId, interviewRequestId);

        updateRoomStatus(interviewRequestId, READY);
    }
}