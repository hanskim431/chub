package com.chub.chat.service;

import com.chub.chat.dto.response.ChatRoomListResponse;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
import com.chub.exception.user.UserException;
import com.chub.repository.UserRepository;
import com.chub.repository.mongo.ChatRoomRepository;
import com.chub.repository.mongo.MessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

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

    @Mock
    private MessageRepository messageRepository;

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

    @Nested
    @DisplayName("채팅방 수신자 목록 조회 로직 테스트")
    class GetParticipantsByRoomIdsExcludeSenderTest {

        @BeforeEach
        void beforeEach() {
            ChatRoom room = ChatRoom.builder()
                    .roomId("1:2")
                    .participantIds(List.of(1L, 2L))
                    .build();
            lenient().when(chatRoomRepository.findByRoomId("1:2"))
                    .thenReturn(Optional.of(room));
        }

        @Test
        @DisplayName("통과: 채팅방 ID 를 통해 수신 대상자가 정상적으로 반환된다.")
        void shouldReturnIdsExcludeSender_WhenGetParticipantsByRoomId() {
            // Given
            // When
            List<Long> list = chatRoomService.getParticipantsByRoomIdsExcludeSender("1:2", 1L);

            // Then
            assertEquals(1, list.size());
            assertEquals(2L, list.getFirst());
        }

        @Test
        @DisplayName("예외: 존재 하지 않는 채팅방에 메시지를 전송할 경우 예외를 던진다.")
        void shouldThrowsException_WhenGetParticipantsByNonExistRoom() {
            // Given
            // When
            // Then
            assertThrowsExactly(ChatException.class,
                    () -> chatRoomService.getParticipantsByRoomIdsExcludeSender("Not-Exist", -1L),
                    "채팅방을 찾을 수 없습니다."
            );
        }
    }

    @Nested
    @DisplayName("채팅방 안읽은 메시지 개수 조회 로직 테스트")
    class GetUnreadMessageAmountTest {

        Long userId1 = 1L;
        Long userId2 = 2L;
        String roomId = "1:2";
        LocalDateTime now = LocalDateTime.now();

        @BeforeEach
        void beforeEach() {
            User opponent = User.builder().sub("2").username("2").build();
            ReflectionTestUtils.setField(opponent, "id", userId2);
            lenient().when(userRepository.findAllById(any()))
                    .thenReturn(List.of(opponent));
        }

        @Test
        @DisplayName("새 메시지가 읽은 시간과 카운트 시간보다 미래일 경우 다시 카운트한다")
        void shouldCount_WhenNewMessageUpdateTimeAfterLastReadTimeAndCountTime() {
            // Given
            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(userId1, userId2))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now.minusHours(2))
                                    .countedAt(now.minusHours(1))
                                    .build(),
                            userId2, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now)  // 새 메시지가 방금 온 상황
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId1))
                    .thenReturn(Optional.of(List.of(room)));
            when(messageRepository.countByRoomIdAndCreatedAtGreaterThan(roomId, now.minusHours(2)))
                    .thenReturn(3);

            // When
            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId1);

            // Then
            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            assertEquals(3, response.getRooms().getFirst().getUnreadCount());
            verify(chatRoomRepository, times(1))
                    .updateUnreadCount(eq(roomId), eq(userId1), eq(3), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("새 메시지가 읽은 시간보다 이전일 경우 카운트하지 않는다")
        void shouldNotCount_WhenNewMessageUpdateTimeBeforeLastReadTime() {
            // Given
            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(userId1, userId2))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now)  // 읽은 시간이 이미 최신
                                    .countedAt(now.minusMinutes(30))
                                    .build(),
                            userId2, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now.minusHours(1))  // 오래된 메시지
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId1))
                    .thenReturn(Optional.of(List.of(room)));

            // When
            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId1);

            // Then
            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            verify(messageRepository, never()).countByRoomIdAndCreatedAtGreaterThan(anyString(), any());
            verify(chatRoomRepository, never()).updateUnreadCount(anyString(), anyLong(), anyInt(), any());
        }

        @Test
        @DisplayName("새 메시지가 카운트 시간보다 이전일 경우 카운트하지 않는다")
        void shouldNotCount_WhenNewMessageUpdateTimeBeforeCountedTime() {
            // Given
            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(userId1, userId2))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now.minusHours(3))
                                    .countedAt(now)  // 최근 카운트함
                                    .build(),
                            userId2, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now.minusMinutes(30))  // 카운트한 이후에 메시지 없음
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId1))
                    .thenReturn(Optional.of(List.of(room)));

            // When
            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId1);

            // Then
            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            verify(messageRepository, never()).countByRoomIdAndCreatedAtGreaterThan(anyString(), any());
            verify(chatRoomRepository, never()).updateUnreadCount(anyString(), anyLong(), anyInt(), any());
        }

        @Test
        @DisplayName("여러 채팅방의 안읽은 메시지를 모두 카운트한다")
        void shouldCountUnread_ForMultipleChatRooms() {
            // Given
            Long userId3 = 3L;
            String roomId2 = "1:3";

            ChatRoom room1 = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(userId1, userId2))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now.minusHours(2))
                                    .countedAt(now.minusHours(1))
                                    .build(),
                            userId2, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now)
                    .build();

            ChatRoom room2 = ChatRoom.builder()
                    .roomId(roomId2)
                    .participantIds(List.of(userId1, userId3))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now.minusHours(1))
                                    .countedAt(now.minusMinutes(30))
                                    .build(),
                            userId3, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now)
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId1))
                    .thenReturn(Optional.of(List.of(room1, room2)));
            when(messageRepository.countByRoomIdAndCreatedAtGreaterThan(roomId, now.minusHours(2)))
                    .thenReturn(3);
            when(messageRepository.countByRoomIdAndCreatedAtGreaterThan(roomId2, now.minusHours(1)))
                    .thenReturn(5);

            User user2 = User.builder().sub("2").username("2").build();
            ReflectionTestUtils.setField(user2, "id", 2L);
            User user3 = User.builder().sub("3").username("3").build();
            ReflectionTestUtils.setField(user3, "id", 3L);

            when(userRepository.findAllById(Set.of(userId2, userId3)))
                    .thenReturn(List.of(
                            user2, user3
                    ));

            // When
            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId1);

            // Then
            assertNotNull(response);
            assertEquals(2, response.getRooms().size());
            assertEquals(3, response.getRooms().get(0).getUnreadCount());
            assertEquals(5, response.getRooms().get(1).getUnreadCount());
            verify(chatRoomRepository, times(2)).updateUnreadCount(anyString(), eq(userId1), anyInt(), any());
        }

        @Test
        @DisplayName("새 메시지가 없을 경우 안읽은 메시지 개수는 0이다")
        void shouldReturnZeroUnread_WhenNoNewMessages() {
            // Given
            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(userId1, userId2))
                    .participants(Map.of(
                            userId1, ChatRoom.ParticipantInfo.builder()
                                    .unreadCount(0)
                                    .lastReadAt(now.minusHours(2))
                                    .countedAt(now.minusHours(1))
                                    .build(),
                            userId2, ChatRoom.ParticipantInfo.builder().build()
                    ))
                    .updatedAt(now.minusHours(3))  // 오래된 업데이트
                    .build();

            when(chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId1))
                    .thenReturn(Optional.of(List.of(room)));

            // When
            ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId1);

            // Then
            assertNotNull(response);
            assertEquals(1, response.getRooms().size());
            assertEquals(0, response.getRooms().getFirst().getUnreadCount());
            verify(messageRepository, never()).countByRoomIdAndCreatedAtGreaterThan(anyString(), any());
        }
    }
}