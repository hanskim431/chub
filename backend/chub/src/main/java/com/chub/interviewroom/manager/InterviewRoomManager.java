package com.chub.interviewroom.manager;

import static com.chub.exception.interview.InterviewRequestException.unauthorizedAccess;
import static com.chub.interviewroom.enums.RoomStatus.READY;
import static com.chub.interviewroom.enums.RoomStatus.WAITING;
import static java.util.Optional.ofNullable;

import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.domain.Participants;
import com.chub.interviewroom.enums.RoomStatus;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class InterviewRoomManager {

    private final Map<Long, InterviewRoomState> interviewRoomInfo = new ConcurrentHashMap<>();
    private final Map<Long, Long> joinedRoom = new ConcurrentHashMap<>();

    public InterviewRoomState joinRoom(Long userId, Long interviewRequestId, InterviewRoomState roomState) {
        // 상태 관리: 방 정보 저장
        interviewRoomInfo.putIfAbsent(interviewRequestId, roomState);

        // 상태 관리: 참가자 검증 및 입장
        joinRoomIfParticipate(userId, interviewRequestId);

        // 실제로 저장된 roomState 반환 (기존 것 or 새로운 것)
        return interviewRoomInfo.get(interviewRequestId);
    }

    public void exitRoom(Long userId, Long interviewRequestId) {

        joinedRoom.remove(userId);

        //TODO : 상태 업데이트 로직 수정 예정
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

    public RoomStatus getRoomStatus(Long interviewRequestId) {
        return interviewRoomInfo.get(interviewRequestId).getStatus();
    }

    public String getNickname(Long userId) {
        Long interviewRequestId = ofNullable(joinedRoom.get(userId))
                .orElseThrow(InterviewRequestException::notFound);

        return interviewRoomInfo.get(interviewRequestId).getParticipants().getNickname(userId);
    }

    public boolean isUserInRoom(Long userId, Long interviewRequestId) {

        Long currentRoomId = joinedRoom.get(userId);

        return interviewRequestId.equals(currentRoomId);
    }

    public void addChatMessage(Long interviewRequestId, InterviewRoomChatMessage message) {

        // InterviewRoomState roomState = ofNullable(interviewRoomInfo.get(interviewRequestId))
        //        .orElseThrow(InterviewRequestException::notFound);

        InterviewRoomState roomState = interviewRoomInfo.get(interviewRequestId);
        if (roomState == null) {
            return;
        }

        roomState.getChatHistory().add(message);
    }

    public Optional<Long> joinedRoomId(Long userId) {
        return ofNullable(joinedRoom.get(userId));
    }

    public boolean isInterviewer(Long userId, Long interviewRequestId) {
        InterviewRoomState roomState = interviewRoomInfo.get(interviewRequestId);
        if (roomState == null) {
            return false;
        }
        return userId.equals(roomState.getParticipants().interviewerId());
    }

    public boolean isInterviewee(Long userId, Long interviewRequestId) {
        InterviewRoomState roomState = interviewRoomInfo.get(interviewRequestId);
        if (roomState == null) {
            return false;
        }
        return userId.equals(roomState.getParticipants().intervieweeId());
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

        participants.idsToList().forEach(id -> {
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

        //TODO : 상태 업데이트 로직 수정 예정
        updateRoomStatus(interviewRequestId, READY);
    }
}