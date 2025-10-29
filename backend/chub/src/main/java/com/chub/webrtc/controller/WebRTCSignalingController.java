package com.chub.webrtc.controller;

import com.chub.webrtc.service.WebRTCSignalingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebRTCSignalingController {

    private final WebRTCSignalingService webRTCSignalingService;

    @MessageMapping("/webrtc/offer")
    public void handleOffer(@Payload Object message, SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        webRTCSignalingService.sendOffer(userId, message);
    }

    @MessageMapping("/webrtc/answer")
    public void handleAnswer(@Payload Object message, SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        webRTCSignalingService.sendAnswer(userId, message);
    }

    @MessageMapping("/webrtc/ice")
    public void handleIce(@Payload Object message, SimpMessageHeaderAccessor headerAccessor) {

        Long userId = getUserId(headerAccessor);

        webRTCSignalingService.sendIceCandidate(userId, message);
    }

    private Long getUserId(SimpMessageHeaderAccessor headerAccessor) {

        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            // do nothing
        }

        return userId;
    }
}
