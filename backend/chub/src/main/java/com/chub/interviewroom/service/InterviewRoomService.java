package com.chub.interviewroom.service;

public interface InterviewRoomService {

    void joinRoom(Long userId, Long interviewRequestId);

    void exitRoom(Long userId, Long interviewRequestId);
}
