package com.chub.chat.service;

import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
import com.chub.exception.user.UserException;
import com.chub.repository.UserRepository;
import com.chub.repository.mongo.ChatRoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.chub.chat.dto.response.ChatRoomListResponse;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
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


    @Nested
    @DisplayName("채팅방 조회/생성 로직 테스트")
    class CreateOrFindChatRoomTest {

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
            when(chatRoomRepository.findByRoomId(chatRoomId))
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

    @Nested
    @DisplayName("채팅방 메타데이터 목록 조회 로직 테스트")
    class FindChatRoomMetaListTest {

        Long userId = 1L;
        Long opponentId1 = 2L;
        Long opponentId2 = 3L;

        User opponent1;
        User opponent2;

        @BeforeEach
        void setup() {
            opponent1 = User.builder().sub("opponent1").username("opponent1").build();
            ReflectionTestUtils.setField(opponent1, "id", opponentId1);

            opponent2 = User.builder().sub("opponent2").username("opponent2").build();
            ReflectionTestUtils.setField(opponent2, "id", opponentId2);
        }

        @Test
        @DisplayName("통과: 채팅방이 없을 때 빈 리스트 반환")
        void shouldReturnEmptyList_WhenNoChatRooms() {
            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.empty());

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertTrue(response.getRooms().isEmpty());
            verify(userRepository, never()).findAllById(anyCollection());
        }

        @Test
        @DisplayName("통과: 채팅방 목록이 최근 업데이트 순으로 반환")
        void shouldReturnChatRooms_SortedByUpdatedAt() {
            LocalDateTime now = LocalDateTime.now();
            ChatRoom room1 = ChatRoom.builder()
                    .roomId("room_1_2")
                    .participantIds(List.of(userId, opponentId1))
                    .updatedAt(now.minusHours(2))
                    .build();

            ChatRoom room2 = ChatRoom.builder()
                    .roomId("room_1_3")
                    .participantIds(List.of(userId, opponentId2))
                    .updatedAt(now)
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.of(List.of(room2, room1)));
            when(userRepository.findAllById(Set.of(opponentId1, opponentId2)))
                    .thenReturn(List.of(opponent1, opponent2));

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertEquals(2, response.getRooms().size());
            assertEquals("room_1_3", response.getRooms().get(0).getRoomId());
            assertEquals("room_1_2", response.getRooms().get(1).getRoomId());
        }

        @Test
        @DisplayName("통과: 상대방 정보가 올바르게 매핑되어 반환")
        void shouldMapOpponentInfo_Correctly() {
            ChatRoom room = ChatRoom.builder()
                    .roomId("room_1_2")
                    .participantIds(List.of(userId, opponentId1))
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.of(List.of(room)));
            when(userRepository.findAllById(Set.of(opponentId1)))
                    .thenReturn(List.of(opponent1));

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            assertNotNull(response.getRooms().getFirst().getOpponent());
            assertEquals(opponentId1, response.getRooms().getFirst().getOpponent().id());
            assertEquals("opponent1", response.getRooms().getFirst().getOpponent().name());
        }

        @Test
        @DisplayName("통과: 여러 채팅방에서 모든 상대방 정보를 조회하고 매핑")
        void shouldCollectAllOpponents_AndMapCorrectly() {
            LocalDateTime now = LocalDateTime.now();
            ChatRoom room1 = ChatRoom.builder()
                    .roomId("room_1_2")
                    .participantIds(List.of(userId, opponentId1))
                    .updatedAt(now)
                    .build();

            ChatRoom room2 = ChatRoom.builder()
                    .roomId("room_1_3")
                    .participantIds(List.of(userId, opponentId2))
                    .updatedAt(now.minusHours(1))
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.of(List.of(room1, room2)));
            when(userRepository.findAllById(Set.of(opponentId1, opponentId2)))
                    .thenReturn(List.of(opponent1, opponent2));

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertEquals(2, response.getRooms().size());
            assertEquals(opponentId1, response.getRooms().get(0).getOpponent().id());
            assertEquals(opponentId2, response.getRooms().get(1).getOpponent().id());
        }

        @Test
        @DisplayName("통과: Unread count가 올바르게 설정되어 반환")
        void shouldReturnCorrectUnreadCount() {
            ChatRoom room = ChatRoom.builder()
                    .roomId("room_1_2")
                    .participantIds(List.of(userId, opponentId1))
                    .participants(Map.of(
                            userId, ChatRoom.ParticipantInfo.builder().unreadCount(3).build(),
                            opponentId1, ChatRoom.ParticipantInfo.builder().unreadCount(0).build()
                    ))
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.of(List.of(room)));
            when(userRepository.findAllById(Set.of(opponentId1)))
                    .thenReturn(List.of(opponent1));

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            assertEquals(3, response.getRooms().getFirst().getUnreadCount());
        }

        @Test
        @DisplayName("통과: Unread count가 없을 때 0으로 반환")
        void shouldReturnZeroUnreadCount_WhenNotSet() {
            ChatRoom room = ChatRoom.builder()
                    .roomId("room_1_2")
                    .participantIds(List.of(userId, opponentId1))
                    .participants(new HashMap<>())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId))
                    .thenReturn(Optional.of(List.of(room)));
            when(userRepository.findAllById(Set.of(opponentId1)))
                    .thenReturn(List.of(opponent1));

            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);

            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            assertEquals(0, response.getRooms().getFirst().getUnreadCount());
        }

    }
}