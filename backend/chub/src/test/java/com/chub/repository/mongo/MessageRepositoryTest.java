package com.chub.repository.mongo;

import com.chub.config.AcceptanceTestWithMongo;
import com.chub.entity.ChatRoom;
import com.chub.entity.Message;
import com.chub.entity.User;
import com.chub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;

class MessageRepositoryTest extends AcceptanceTestWithMongo {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private UserRepository userRepository;

    private final static LocalDateTime BASE_TIME = LocalDateTime.of(2025, 1, 2, 3, 4);

    @Nested
    class FindMessagesByRoomId {

        @BeforeEach
        @DisplayName("더미 데이터 생성")
        void setUp() {
            lenient().when(userRepository.findById((long) 1))
                    .thenReturn(Optional.of(User.of("user" + 1, "user" + 1)));
            lenient().when(userRepository.findById((long) 2))
                    .thenReturn(Optional.of(User.of("user" + 2, "user" + 2)));

            chatRoomRepository.save(generateDummyChatRoom(1L, 2L));

            // 명확한 메시지 시간 생성 (최신순으로 정렬)
            // message1: 10분 전 (가장 오래됨)
            // message2: 8분 전
            // message3: 6분 전
            // message4: 4분 전
            // message5: 2분 전 (가장 최신)
            for (int i = 0; i < 5; i++) {
                messageRepository.save(
                        generateDummyMessageWithCreatedAt(BASE_TIME.minusMinutes(10 - i * 2)));
            }
        }

        @Test
        @DisplayName("통과: cursor보다 이전 메시지를 페이지 크기만큼 가져온다")
        void shouldReturnMessages_WhenFindByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc() {
            Pageable pageable = PageRequest.of(0, 3);

            // cursor = BASE_TIME - 1분 (message5가 더 최신이므로 제외)
            // 조회 대상: message1(10분), message2(8분), message3(6분), message4(4분)
            // 최신순 정렬: message4(4분) > message3(6분) > message2(8분) > message1(10분)
            // pageSize=3 → message4, message3, message2 반환
            List<Message> messages1 =
                    messageRepository.findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                            "1:2", BASE_TIME.minusMinutes(1), pageable);
            assertEquals(3, messages1.size());

            // cursor = BASE_TIME - 7분 (message3, message4, message5 제외)
            // 조회 대상: message1(10분), message2(8분)
            // 최신순 정렬: message2(8분) > message1(10분)
            // pageSize=3 → message2, message1 반환
            List<Message> messages2 =
                    messageRepository.findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                            "1:2", BASE_TIME.minusMinutes(7), pageable);
            assertEquals(2, messages2.size());
        }

    }

    private Message generateDummyMessageWithCreatedAt(LocalDateTime localDateTime) {
        return Message.builder()
                .roomId(generateRoomId(1L, 2L))
                .content(generateRoomId(1L, 2L) + ": test message " + localDateTime)
                .messageFrom(1L)
                .createdAt(localDateTime)
                .build();
    }

    private ChatRoom generateDummyChatRoom(Long user1, Long user2) {
        return ChatRoom.builder()
                .roomId(generateRoomId(user1, user2))
                .participantIds(List.of(user1, user2))
                .updatedAt(BASE_TIME.minusMinutes(user1 + user2))
                .build();

    }

    private String generateRoomId(Long user1, Long user2) {
        return user1 + ":" + user2;
    }
}