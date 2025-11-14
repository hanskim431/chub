package com.chub.repository.mongo;

import com.chub.config.AcceptanceTestWithMongo;
import com.chub.entity.ChatRoom;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ChatRoomRepositoryTest extends AcceptanceTestWithMongo {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @BeforeEach
    void setUp() {
        // 더미 데이터 저장
        ChatRoom room1 = ChatRoom.builder()
                .roomId("room_1_2")
                .participantIds(List.of(1L, 2L))
                .updatedAt(LocalDateTime.now().minusHours(1))
                .build();

        ChatRoom room2 = ChatRoom.builder()
                .roomId("room_1_3")
                .participantIds(List.of(1L, 3L))
                .updatedAt(LocalDateTime.now())
                .build();

        chatRoomRepository.save(room1);
        chatRoomRepository.save(room2);
    }

    @Test
    void findByRoomId() {
        Optional<ChatRoom> result = chatRoomRepository
                .findByRoomId("room_1_2");

        assertTrue(result.isPresent());
        assertEquals("room_1_2", result.get().getRoomId());
    }

    @Test
    void findByParticipantIdsContainingOrderByUpdatedAtDesc() {
        Optional<List<ChatRoom>> result = chatRoomRepository
                .findByParticipantIdsContainingOrderByUpdatedAtDesc(1L);

        assertTrue(result.isPresent());
        assertEquals(2, result.get().size());
        assertEquals("room_1_3", result.get().get(0).getRoomId());  // 더 최신
        assertEquals("room_1_2", result.get().get(1).getRoomId());
    }

    @Nested
    @DisplayName("updateReadReceipt 메서드 테스트")
    class UpdateReadReceiptTest {

        String roomId = "1:2";
        Long userId = 1L;

        @BeforeEach
        void setUp() {
            // 참여자 정보를 포함한 채팅방 생성
            Map<Long, ChatRoom.ParticipantInfo> participants = new HashMap<>();
            participants.put(1L, ChatRoom.ParticipantInfo.builder()
                    .unreadCount(5)
                    .lastReadAt(LocalDateTime.now().minusHours(2))
                    .build());
            participants.put(2L, ChatRoom.ParticipantInfo.builder()
                    .unreadCount(3)
                    .lastReadAt(LocalDateTime.now().minusHours(1))
                    .build());

            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(1L, 2L))
                    .participants(participants)
                    .updatedAt(LocalDateTime.now())
                    .build();

            chatRoomRepository.save(room);
        }

        @Test
        @DisplayName("특정 사용자의 unreadCount를 0으로, lastReadAt을 업데이트한다")
        void shouldUpdateReadReceipt_SetUnreadCountToZeroAndUpdateLastReadAt() {
            // Given
            LocalDateTime readTime = LocalDateTime.now();

            // When
            chatRoomRepository.updateReadReceipt(roomId, userId, readTime);

            // Then
            Optional<ChatRoom> result = chatRoomRepository.findByRoomId(roomId);
            assertTrue(result.isPresent());
            ChatRoom updatedRoom = result.get();

            ChatRoom.ParticipantInfo participantInfo = updatedRoom.getParticipants().get(userId);
            assertNotNull(participantInfo);
            assertEquals(0, participantInfo.getUnreadCount());
            assertEquals(readTime.withNano(0),
                    participantInfo.getLastReadAt().withNano(0));
        }

        @Test
        @DisplayName("다른 사용자의 정보는 변경되지 않는다")
        void shouldNotAffectOtherParticipants() {
            // Given
            Long otherUserId = 2L;
            LocalDateTime readTime = LocalDateTime.now();
            ChatRoom beforeUpdate = chatRoomRepository.findByRoomId(roomId).get();
            int otherUserUnreadCount = beforeUpdate.getParticipants().get(otherUserId).getUnreadCount();

            // When
            chatRoomRepository.updateReadReceipt(roomId, userId, readTime);

            // Then
            Optional<ChatRoom> result = chatRoomRepository.findByRoomId(roomId);
            assertTrue(result.isPresent());
            ChatRoom updatedRoom = result.get();

            ChatRoom.ParticipantInfo otherParticipant = updatedRoom.getParticipants().get(otherUserId);
            assertEquals(otherUserUnreadCount, otherParticipant.getUnreadCount());
        }
    }

    @Nested
    @DisplayName("updateUnreadCount 메서드 테스트")
    class UpdateUnreadCountTest {

        String roomId = "1:2";
        Long userId = 1L;

        @BeforeEach
        void setUp() {
            Map<Long, ChatRoom.ParticipantInfo> participants = new HashMap<>();
            participants.put(1L, ChatRoom.ParticipantInfo.builder()
                    .unreadCount(0)
                    .lastReadAt(LocalDateTime.now().minusHours(2))
                    .countedAt(LocalDateTime.now().minusHours(1))
                    .build());
            participants.put(2L, ChatRoom.ParticipantInfo.builder()
                    .unreadCount(2)
                    .lastReadAt(LocalDateTime.now())
                    .build());

            ChatRoom room = ChatRoom.builder()
                    .roomId(roomId)
                    .participantIds(List.of(1L, 2L))
                    .participants(participants)
                    .updatedAt(LocalDateTime.now())
                    .build();

            chatRoomRepository.save(room);
        }

        @AfterEach
        void afterEach() {
            chatRoomRepository.findByRoomId(roomId).ifPresent(chatRoomRepository::delete);
        }

        @Test
        @DisplayName("특정 사용자의 unreadCount와 countedAt을 업데이트한다")
        void shouldUpdateUnreadCount_AndCountedAt() {
            // Given
            Integer newUnreadCount = 7;
            LocalDateTime countedTime = LocalDateTime.now();

            // When
            chatRoomRepository.updateUnreadCount(roomId, userId, newUnreadCount, countedTime);

            // Then
            Optional<ChatRoom> result = chatRoomRepository.findByRoomId(roomId);
            assertTrue(result.isPresent());
            ChatRoom updatedRoom = result.get();

            ChatRoom.ParticipantInfo participantInfo = updatedRoom.getParticipants().get(userId);
            assertNotNull(participantInfo);
            assertEquals(newUnreadCount, participantInfo.getUnreadCount());
            assertEquals(countedTime.withNano(0),
                    participantInfo.getCountedAt().withNano(0));
        }

        @Test
        @DisplayName("lastReadAt은 변경되지 않는다")
        void shouldNotChangeLastReadAt() {
            // Given
            ChatRoom beforeUpdate = chatRoomRepository.findByRoomId(roomId).get();
            LocalDateTime originalLastReadAt = beforeUpdate.getParticipants().get(userId).getLastReadAt();

            Integer newUnreadCount = 5;
            LocalDateTime countedTime = LocalDateTime.now();

            // When
            chatRoomRepository.updateUnreadCount(roomId, userId, newUnreadCount, countedTime);

            // Then
            Optional<ChatRoom> result = chatRoomRepository.findByRoomId(roomId);
            assertTrue(result.isPresent());
            ChatRoom updatedRoom = result.get();

            ChatRoom.ParticipantInfo participantInfo = updatedRoom.getParticipants().get(userId);
            assertEquals(originalLastReadAt, participantInfo.getLastReadAt());
        }

        @Test
        @DisplayName("다른 사용자의 정보는 변경되지 않는다")
        void shouldNotAffectOtherParticipants() {
            // Given
            Long otherUserId = 2L;
            ChatRoom beforeUpdate = chatRoomRepository.findByRoomId(roomId).get();
            ChatRoom.ParticipantInfo otherParticipantBefore = beforeUpdate.getParticipants().get(otherUserId);

            Integer newUnreadCount = 10;
            LocalDateTime countedTime = LocalDateTime.now();

            // When
            chatRoomRepository.updateUnreadCount(roomId, userId, newUnreadCount, countedTime);

            // Then
            Optional<ChatRoom> result = chatRoomRepository.findByRoomId(roomId);
            assertTrue(result.isPresent());
            ChatRoom updatedRoom = result.get();

            ChatRoom.ParticipantInfo otherParticipantAfter = updatedRoom.getParticipants().get(otherUserId);
            assertEquals(otherParticipantBefore.getUnreadCount(), otherParticipantAfter.getUnreadCount());
        }
    }

}