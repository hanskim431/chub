package com.chub.websocket.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WebSocketMessage {
    private String type;
    private Object data;
    private LocalDateTime timestamp;

    public static WebSocketMessage of(String type, Object data) {
        return new WebSocketMessage(type, data, LocalDateTime.now());
    }
}
