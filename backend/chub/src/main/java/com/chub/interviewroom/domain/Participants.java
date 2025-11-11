package com.chub.interviewroom.domain;

import java.util.List;

public record Participants(Long interviewerId,
                           String interviewerNickname,
                           Long intervieweeId,
                           String intervieweeNickname) {

    public boolean contains(Long userId) {
        return userId.equals(interviewerId()) || userId.equals(intervieweeId());
    }

    public List<Long> idsToList() {
        return List.of(interviewerId(), intervieweeId());
    }

    public String getNickname(Long userId) {

        if (!contains(userId)) {
            return null;
        }

        if (userId.equals(interviewerId())) {
            return interviewerNickname();
        }

        return intervieweeNickname();
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
