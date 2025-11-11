package com.chub.interviewroom.service;

import com.chub.interviewroom.domain.InterviewRoomChatMessage;

public interface InterviewRoomService {

    void joinRoom(Long userId, Long interviewRequestId);

    void exitRoom(Long userId, Long interviewRequestId);

    void sendUserChat(Long userId, Long interviewRequestId, InterviewRoomChatMessage message);
}
