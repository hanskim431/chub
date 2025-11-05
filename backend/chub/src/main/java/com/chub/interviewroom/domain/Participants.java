package com.chub.interviewroom.domain;

import java.util.List;

public record Participants(Long interviewerId, Long intervieweeId) {
    public boolean contains(Long userId) {
        return userId.equals(interviewerId()) || userId.equals(intervieweeId());
    }

    public List<Long> toList() {
        return List.of(interviewerId(), intervieweeId());
    }

    public Long getOpponentId(Long userId) {

        if (!contains(userId)) {
            return null;
        }

        if (userId.equals(interviewerId())) {
            return intervieweeId();
        }

        return interviewerId();
    }
}
