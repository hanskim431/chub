package com.chub.chat.controller;

import com.chub.chat.dto.websocket.ChatMessageRequest;
import com.chub.chat.service.MessageService;
import com.chub.exception.user.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
@RequiredArgsConstructor
public class ChatWebsocketController {

    private final MessageService messageService;

    @MessageMapping("/chat/send")
    public void sendMessage(
            ChatMessageRequest message,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long userId = getUserId(headerAccessor);
        messageService.sendMessage(message, userId);
    }

    private Long getUserId(SimpMessageHeaderAccessor headerAccessor) {
        try {
            return (Long) Objects.requireNonNull(
                    headerAccessor.getSessionAttributes()).get("userId");
        } catch (NullPointerException e) {
            throw UserException.notLoggedIn();
        }
    }
}
