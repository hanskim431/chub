package com.chub.interviewroom.service;

import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.dto.JoinRoomDto;

public interface InterviewRoomService {

    JoinRoomDto joinRoom(Long userId, Long interviewRequestId);

    void exitRoom(Long userId, Long interviewRequestId);

    void sendUserChat(Long userId, Long interviewRequestId, InterviewRoomChatMessage message);
}
