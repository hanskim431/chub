package com.chub.interviewroom.controller;

import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.service.InterviewRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class InterviewRoomChatController {

    private final InterviewRoomService interviewRoomService;

    @MessageMapping("/interview/{interviewRequestId}/chat-send")
    public void handleInterviewRoomChat(@DestinationVariable Long interviewRequestId,
                                        SimpMessageHeaderAccessor headerAccessor,
                                        InterviewRoomChatMessage message) {

        Long userId = getUserId(headerAccessor);

        log.info("InterviewRoom Chat Arrived: {}", message.getMessage());

        interviewRoomService.sendUserChat(userId, interviewRequestId, message);
    }

    @MessageMapping("/interview/{interviewRequestId}/joined")
    public void handleJoin(@DestinationVariable Long interviewRequestId, SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        log.info("Interview Room [{}]: User [{}] Joined", interviewRequestId, userId);
    }

    private Long getUserId(SimpMessageHeaderAccessor headerAccessor) {
        return (Long) headerAccessor.getSessionAttributes().get("userId");
    }
}
