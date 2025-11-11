package com.chub.Interview.controller;

import com.chub.Interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class InterviewWebSocketController {

    private final InterviewService interviewService;

    @MessageMapping("/interview/start")
    public void handleInterviewStart(SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        interviewService.startInterview(userId);
    }

    @MessageMapping("/interview/end")
    public void handleInterviewEnd(SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        interviewService.endInterview(userId);
    }

    private Long getUserId(SimpMessageHeaderAccessor headerAccessor) {
        return (Long) headerAccessor.getSessionAttributes().get("userId");
    }
}
