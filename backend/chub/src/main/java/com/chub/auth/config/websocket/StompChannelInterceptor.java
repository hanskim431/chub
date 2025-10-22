package com.chub.auth.config.websocket;

import com.chub.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * WebSocket STOMP 메시지 레벨 인터셉터
 * HandshakeInterceptor에서 설정한 사용자 정보를 Principal로 설정
 */
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            handleConnect(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) return;

        Boolean authenticated = (Boolean) sessionAttributes.get("authenticated");
        Long userId = (Long) sessionAttributes.get("userId");

        if (!Boolean.TRUE.equals(authenticated) || userId == null) return;

        accessor.setUser(new UserPrincipal(userId.toString()));
    }
}
