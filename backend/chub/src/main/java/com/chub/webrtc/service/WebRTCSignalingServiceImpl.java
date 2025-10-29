package com.chub.webrtc.service;

import com.chub.websocket.util.WebSocketHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebRTCSignalingServiceImpl implements WebRTCSignalingService {

    private final WebSocketHelper webSocketHelper;

    private static final String OFFER = "webrtc-offer";
    private static final String ANSWER = "webrtc-answer";
    private static final String ICE = "webrtc-ice";

    @Override
    public void sendOffer(Long userId, Object payload) {
        handleSignal(userId, OFFER, payload);
    }

    @Override
    public void sendAnswer(Long userId, Object payload) {
        handleSignal(userId, ANSWER, payload);
    }

    @Override
    public void sendIceCandidate(Long userId, Object payload) {
        handleSignal(userId, ICE, payload);
    }

    private void handleSignal(Long userId, String type, Object payload) {

        Long receiverId = getReceiverId(userId);

        webSocketHelper.sendPersonalMessage(receiverId, type, payload);
    }

    private Long getReceiverId(Long userId) {
        // 임시로 자기 id 반환
        // interviewRoomManager 구현 후 상대 id 반환 예정
        return userId;
    }
}
