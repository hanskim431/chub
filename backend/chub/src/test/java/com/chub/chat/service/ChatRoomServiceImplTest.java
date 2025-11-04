package com.chub.chat.service;

import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
import com.chub.exception.user.UserException;
import com.chub.repository.mongo.ChatRoomRepository;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatRoomService 테스트")
class ChatRoomServiceImplTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatRoomServiceImpl chatRoomService;

    Long userId1 = 1L;
    Long userId2 = 2L;

    String chatRoomId = "1:2";

    @BeforeEach
    void setup() {
        User user1 = User.of("user1", "user1");
        User user2 = User.of("user2", "user2");

        lenient().when(userRepository.findById(userId1)).thenReturn(Optional.of(user1));
        lenient().when(userRepository.findById(userId2)).thenReturn(Optional.of(user2));
        lenient().when(chatRoomRepository.findById(anyString())).thenReturn(Optional.empty());
    }

    @Test
    @DisplayName("통과: 채팅방 생성 시 새로운 방 생성 및 ID 반환")
    void shouldCreateChatRoom_AndReturnRoomId() {
        CreateChatRoomResponse response = chatRoomService.findOrCreateChatRoom(userId1, userId2);

        assertEquals(chatRoomId, response.roomId());

        verify(chatRoomRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("통과: 이미 있는 채팅방 생성(조회) 시 저장 없이 기존 방 ID 반환")
    void shouldReturnChatRoomId_WhenExist() {
        when(chatRoomRepository.findByRoomIdContainingOrderByUpdatedAtDesc(chatRoomId))
                .thenReturn(Optional.of(ChatRoom.builder().roomId(chatRoomId).build()));

        CreateChatRoomResponse response = chatRoomService.findOrCreateChatRoom(userId1, userId2);

        assertEquals(chatRoomId, response.roomId());
        verify(chatRoomRepository, times(0)).save(any());
    }

    @Test
    @DisplayName("통과: 채팅방 생성 시 순서와 관계없이 동일한 ID 생성")
    void shouldReturnSameChatRoomId_RegardlessOfUserOrder() {
        CreateChatRoomResponse response1 = chatRoomService.findOrCreateChatRoom(userId1, userId2);
        CreateChatRoomResponse response2 = chatRoomService.findOrCreateChatRoom(userId2, userId1);

        assertEquals(chatRoomId, response1.roomId());
        assertEquals(chatRoomId, response2.roomId());
    }

    @Test
    @DisplayName("예외: 유저 Id와 상대방 Id가 동일할 경우 예외 반환")
    void shouldThrowException_WhenEqualUserId() {
        ChatException exception = assertThrows(ChatException.selfChatNotAllowed().getClass(), () ->
                chatRoomService.findOrCreateChatRoom(userId1, userId1));

        assertEquals(ChatException.selfChatNotAllowed().getExceptionMessage(),
                exception.getExceptionMessage());
    }

    @Test
    @DisplayName("예외: 채팅 상대방 유저가 존재하지 않을 경우 예외 반환")
    void shouldThrowException_WhenOpponentInvalid() {
        UserException exception = assertThrows(UserException.userNotFound().getClass(),
                () -> chatRoomService.findOrCreateChatRoom(userId1, 9999L));

        assertEquals(UserException.userNotFound().getExceptionMessage(),
                exception.getExceptionMessage());
    }

    @Test
    @DisplayName("예외: 채팅 Id에 null이 들어올 경우 예외 반환")
    void shouldThrowException_WhenUserIdNull() {
        UserException exception = assertThrows(UserException.invalidUserFormat().getClass(), () ->
                chatRoomService.findOrCreateChatRoom(userId1, null));

        assertEquals(UserException.invalidUserFormat().getExceptionMessage(),
                exception.getExceptionMessage());
    }
}