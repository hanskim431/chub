package com.chub.webrtc.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chub.webrtc.service.WebRTCSignalingService;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

@ExtendWith(MockitoExtension.class)
public class WebRTCSignalingControllerTest {

    @Mock
    private WebRTCSignalingService webRTCSignalingService;

    @Mock
    private SimpMessageHeaderAccessor headerAccessor;

    @InjectMocks
    private WebRTCSignalingController webRTCSignalingController;

    private static final Long USER_ID = 1L;
    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() {
        sessionAttributes = new HashMap<>();
        sessionAttributes.put("userId", USER_ID);
        when(headerAccessor.getSessionAttributes()).thenReturn(sessionAttributes);
    }

    @Test
    void handleOffer_Success() {
        // given
        Object offerMessage = Map.of(
                "type", "offer",
                "sdp", "mock-sdp-data"
        );

        // when
        webRTCSignalingController.handleOffer(offerMessage, headerAccessor);

        // then
        verify(webRTCSignalingService, times(1)).sendOffer(eq(USER_ID), eq(offerMessage));
    }

    @Test
    void handleAnswer_Success() {
        // given
        Object answerMessage = Map.of(
                "type", "answer",
                "sdp", "mock-sdp-data"
        );

        // when
        webRTCSignalingController.handleAnswer(answerMessage, headerAccessor);

        // then
        verify(webRTCSignalingService, times(1)).sendAnswer(eq(USER_ID), eq(answerMessage));
    }

    @Test
    void handleIce_Success() {
        // given
        Object iceMessage = Map.of(
                "candidate", "mock-ice-candidate",
                "sdpMid", "0",
                "sdpMLineIndex", 0
        );

        // when
        webRTCSignalingController.handleIce(iceMessage, headerAccessor);

        // then
        verify(webRTCSignalingService, times(1)).sendIceCandidate(eq(USER_ID), eq(iceMessage));
    }
}
