package com.chub.webrtc.service;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.websocket.util.WebSocketHelper;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class WebRTCSignalingServiceTest {

    @Mock
    private WebSocketHelper webSocketHelper;

    @Mock
    private InterviewRoomManager interviewRoomManager;

    @InjectMocks
    private WebRTCSignalingServiceImpl webRTCSignalingService;

    private static final Long USER_ID = 1L;
    private static final Long RECEIVER_ID = 2L;
    private static final String OFFER = "webrtc-offer";
    private static final String ANSWER = "webrtc-answer";
    private static final String ICE = "webrtc-ice";

    @BeforeEach
    void setUp() {
        when(interviewRoomManager.getOpponentId(USER_ID)).thenReturn(RECEIVER_ID);
    }

    @Test
    void sendOffer_Success() {
        // given
        Object offerPayload = Map.of(
                "type", "offer",
                "sdp", "mock-sdp-data"
        );

        // when
        webRTCSignalingService.sendOffer(USER_ID, offerPayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(OFFER),
                eq(offerPayload)
        );
    }

    @Test
    void sendAnswer_Success() {
        // given
        Object answerPayload = Map.of(
                "type", "answer",
                "sdp", "mock-sdp-data"
        );

        // when
        webRTCSignalingService.sendAnswer(USER_ID, answerPayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(ANSWER),
                eq(answerPayload)
        );
    }

    @Test
    void sendIceCandidate_Success() {
        // given
        Object icePayload = Map.of(
                "candidate", "mock-ice-candidate",
                "sdpMid", "0",
                "sdpMLineIndex", 0
        );

        // when
        webRTCSignalingService.sendIceCandidate(USER_ID, icePayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(ICE),
                eq(icePayload)
        );
    }

    @Test
    void sendOffer_WithNullPayload() {
        // given
        Object nullPayload = null;

        // when
        webRTCSignalingService.sendOffer(USER_ID, nullPayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(OFFER),
                eq(nullPayload)
        );
    }

    @Test
    void sendAnswer_WithNullPayload() {
        // given
        Object nullPayload = null;

        // when
        webRTCSignalingService.sendAnswer(USER_ID, nullPayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(ANSWER),
                eq(nullPayload)
        );
    }

    @Test
    void sendIceCandidate_WithNullPayload() {
        // given
        Object nullPayload = null;

        // when
        webRTCSignalingService.sendIceCandidate(USER_ID, nullPayload);

        // then
        verify(webSocketHelper, times(1)).sendPersonalMessage(
                eq(RECEIVER_ID),
                eq(ICE),
                eq(nullPayload)
        );
    }
}