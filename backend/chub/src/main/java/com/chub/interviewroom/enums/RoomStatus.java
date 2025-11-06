package com.chub.interviewroom.enums;

import java.util.Map;
import java.util.Set;

public enum RoomStatus {
    WAITING("Waiting", "사용자가 모두 들어오지 않았습니다."),
    READY("Ready", "면접 시작 준비가 완료되었습니다."),
    QUESTION("Questioning", "질문이 진행중입니다."),
    ANSWER("Answering", "답변이 진행중입니다."),
    FINISH("Finished", "면접이 종료되었습니다.");

    private final String status;
    private final String message;

    private static final Map<RoomStatus, Set<RoomStatus>> TRANSITIONS = Map.of(
            WAITING, Set.of(READY),
            READY, Set.of(WAITING, QUESTION),
            QUESTION, Set.of(ANSWER, FINISH),
            ANSWER, Set.of(QUESTION, FINISH),
            FINISH, Set.of(READY)
    );

    RoomStatus(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public boolean canTransitionTo(RoomStatus target) {
        Set<RoomStatus> allowedTargets = TRANSITIONS.get(this);
        return allowedTargets != null && allowedTargets.contains(target);
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}