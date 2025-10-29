package com.chub.websocket.util;

import com.chub.websocket.response.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketHelper {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String USER_QUEUE_PREFIX = "/queue";
    private static final String TOPIC_PREFIX = "/topic";
    private static final String ERROR = "error";

    public void sendPersonalMessage(Long userId, String type, Object data) {

        Object payload = createPayload(type, data);

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                USER_QUEUE_PREFIX,
                payload
        );
    }

    public void broadcastMessage(String destination, String type, Object data) {

        Object payload = createPayload(type, data);

        messagingTemplate.convertAndSend(
                TOPIC_PREFIX + destination,
                payload
        );
    }

    public void sendErrorMessage(Long userId, String message) {
        sendPersonalMessage(userId, ERROR, message);
    }

    private WebSocketMessage createPayload(String type, Object data) {
        return WebSocketMessage.of(type, data);
    }
}
