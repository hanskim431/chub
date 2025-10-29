package com.chub.webrtc.service;

public interface WebRTCSignalingService {

    void sendOffer(Long userId, Object payload);

    void sendAnswer(Long userId, Object payload);

    void sendIceCandidate(Long userId, Object payload);
}
