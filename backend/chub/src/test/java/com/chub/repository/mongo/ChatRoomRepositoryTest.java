package com.chub.repository.mongo;

import com.chub.config.AcceptanceTestWithMongo;
import com.chub.entity.ChatRoom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
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
}