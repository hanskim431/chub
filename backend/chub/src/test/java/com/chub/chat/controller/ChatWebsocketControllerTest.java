package com.chub.chat.controller;

import com.chub.chat.dto.websocket.ChatMessageRequest;
import com.chub.chat.service.MessageService;
import com.chub.exception.user.UserException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatWebsocketController 테스트")
class ChatWebsocketControllerTest {

    @Mock
    private MessageService messageService;

    @Mock
    private SimpMessageHeaderAccessor headerAccessor;

    @InjectMocks
    private ChatWebsocketController chatWebsocketController;

    private final static Long USER_ID_1 = 1L;

    @Nested
    @DisplayName("메시지 전송")
    class SendMessageTest {

        @BeforeEach
        void beforeEach() {
            Map<String, Object> sessionAttributes = Map.of("userId", USER_ID_1);
            when(headerAccessor.getSessionAttributes()).thenReturn(sessionAttributes);
        }

        @Test
        @DisplayName("메시지 전송 요청시 messageService로 위임한다")
        void shouldDelegateMessageSendingToService() {
            // Given
            ChatMessageRequest messageRequest = new ChatMessageRequest("room_1_2", "test message");

            // When
            chatWebsocketController.sendMessage(messageRequest, headerAccessor);

            // Then
            verify(messageService, times(1))
                    .sendMessage(eq(messageRequest), eq(USER_ID_1));
        }

        @Test
        @DisplayName("userId 추출 실패시 UserException을 발생시킨다")
        void shouldThrowUserException_WhenUserIdExtractionFails() {
            // Given
            ChatMessageRequest messageRequest = new ChatMessageRequest("room_1_2", "test message");
            when(headerAccessor.getSessionAttributes()).thenThrow(NullPointerException.class);

            // When & Then
            assertThrows(UserException.class,
                    () -> chatWebsocketController.sendMessage(messageRequest, headerAccessor)
            );
            verify(messageService, never()).sendMessage(any(), any());
        }
    }

}