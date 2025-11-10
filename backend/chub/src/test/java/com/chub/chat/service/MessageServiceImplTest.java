package com.chub.chat.service;

import com.chub.chat.dto.response.MessageListResponse;
import com.chub.entity.ChatRoom;
import com.chub.entity.Message;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatRoomService 테스트")
class MessageServiceImplTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MessageServiceImpl messageService;

    @Nested
    @DisplayName("메시지 목록 조회 로직 테스트")
    class GetMessageListTest {

        private final String ROOM_ID_1_2 = "1:2";
        private final LocalDateTime BASE_TIME = LocalDateTime.of(2025, 1, 2, 3, 4);
        private final int PAGE_SIZE = 3;

        @BeforeEach
        void setup() {
            User user1 = User.of("user1", "user1");
            User user2 = User.of("user2", "user2");

            // ReflectionTestUtils를 사용해 자동 생성 id를 수동으로 설정
            ReflectionTestUtils.setField(user1, "id", 1L);
            ReflectionTestUtils.setField(user2, "id", 2L);

            lenient().when(userRepository.findById(1L))
                    .thenReturn(Optional.of(user1));
            lenient().when(userRepository.findById(2L))
                    .thenReturn(Optional.of(user2));
            lenient().when(userRepository.findAllById(List.of(1L, 2L)))
                    .thenReturn(List.of(user1, user2));

            ChatRoom chatRoom = ChatRoom.builder()
                    .roomId(ROOM_ID_1_2)
                    .participantIds(List.of(1L, 2L))
                    .updatedAt(BASE_TIME)
                    .build();
            lenient().when(chatRoomRepository.findByRoomId(ROOM_ID_1_2))
                    .thenReturn(Optional.of(chatRoom));

            // Message 더미 데이터 생성
            // message1: 10분 전 (가장 오래됨)
            // message2: 8분 전
            // message3: 6분 전
            // message4: 4분 전
            // message5: 2분 전 (가장 최신)
            List<Message> messages = new java.util.ArrayList<>();
            for (int i = 0; i < 5; i++) {
                messages.add(Message.builder()
                        .roomId(ROOM_ID_1_2)
                        .content("test message " + i)
                        .messageFrom(1L)
                        .createdAt(BASE_TIME.minusMinutes(10 - i * 2))
                        .build());
            }

            lenient().when(messageRepository.findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                            anyString(), any(), any()))
                    .thenReturn(messages.stream()
                            .filter(m -> m.getCreatedAt().isBefore(BASE_TIME.minusMinutes(1)))
                            .limit(PAGE_SIZE + 1)
                            .toList());
        }

        @Test
        @DisplayName("통과: cursor보다 이전 메시지를 페이지네이션해 MessageListResponse에 담아 반환한다.")
        void shouldReturnMessageListResponse_WhenFindByCursorWithPagination() {
            // When: cursor(BASE_TIME + 2분)보다 이전 메시지 3개 조회
            MessageListResponse response = messageService.findByRoomIdBeforeDate(ROOM_ID_1_2, BASE_TIME.plusMinutes(1), PAGE_SIZE);

            // Then: 응답 검증
            assertAll("MessageListResponse 검증",
                    // RoomId 검증
                    () -> assertEquals(ROOM_ID_1_2, response.roomId(), "roomId가 일치해야 함"),

                    // Message 검증
                    () -> assertNotNull(response.message(), "메시지 목록이 null이 아니어야 함"),
                    () -> assertEquals(PAGE_SIZE, response.message().size(), "페이지 크기만큼 메시지를 반환해야 함"),
                    () -> assertTrue(response.message().stream()
                                    .allMatch(m -> m.createdAt().isBefore(BASE_TIME.plusMinutes(1))),
                            "모든 메시지의 시간이 cursor보다 이전이어야 함"),

                    // Participants 검증
                    () -> assertNotNull(response.participants(), "참여자 정보가 null이 아니어야 함"),
                    () -> assertEquals(2, response.participants().size(), "2명의 참여자가 있어야 함"),
                    () -> assertTrue(response.participants().containsKey("1"), "user1(id=1)이 포함되어야 함"),
                    () -> assertTrue(response.participants().containsKey("2"), "user2(id=2)이 포함되어야 함"),

                    // Pagination 검증
                    () -> assertNotNull(response.pagination(), "페이지네이션 정보가 null이 아니어야 함"),
                    () -> assertEquals(PAGE_SIZE, response.pagination().pageSize(), "페이지 크기가 일치해야 함"),
                    () -> assertTrue(response.pagination().hasNext(), "더 이상의 데이터가 있어야 함"),
                    () -> assertNotNull(response.pagination().nextCursor(), "다음 cursor가 존재해야 함")
            );

        }

        @Test
        @DisplayName("예외: ChatRoom이 존재하지 않으면 ChatException을 throw한다.")
        void shouldThrowChatException_WhenChatRoomNotFound() {
            // Given: 존재하지 않는 roomId
            String nonExistentRoomId = "non-existent";
            lenient().when(chatRoomRepository.findByRoomId(nonExistentRoomId))
                    .thenReturn(Optional.empty());

            // When & Then: ChatException이 throw되는지 확인
            assertThrows(ChatException.class,
                    () -> messageService.findByRoomIdBeforeDate(nonExistentRoomId, BASE_TIME, PAGE_SIZE),
                    "ChatRoom이 없으면 ChatException을 throw해야 함");
        }

        @Test
        @DisplayName("통과: ChatRoom은 있으나 메시지가 없으면 빈 리스트와 페이지네이션 정보를 반환한다.")
        void shouldReturnEmptyMessageList_WhenNoMessagesFound() {
            // Given: 메시지가 없는 경우
            lenient().when(messageRepository.findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                            anyString(), any(), any()))
                    .thenReturn(List.of());  // 빈 리스트 반환

            // When: 메시지 목록 조회
            MessageListResponse response = messageService.findByRoomIdBeforeDate(ROOM_ID_1_2, BASE_TIME, PAGE_SIZE);

            // Then: 응답 검증
            assertAll("빈 메시지 목록 검증",
                    // RoomId 검증
                    () -> assertEquals(ROOM_ID_1_2, response.roomId(), "roomId가 일치해야 함"),

                    // Message 검증
                    () -> assertNotNull(response.message(), "메시지 목록이 null이 아니어야 함"),
                    () -> assertTrue(response.message().isEmpty(), "메시지 목록이 비어있어야 함"),

                    // Participants 검증
                    () -> assertNotNull(response.participants(), "참여자 정보가 null이 아니어야 함"),
                    () -> assertEquals(2, response.participants().size(), "2명의 참여자가 있어야 함"),
                    () -> assertTrue(response.participants().containsKey("1"), "user1(id=1)이 포함되어야 함"),
                    () -> assertTrue(response.participants().containsKey("2"), "user2(id=2)이 포함되어야 함"),

                    // Pagination 검증 (메시지가 없으므로 hasNext=false, nextCursor=null)
                    () -> assertNotNull(response.pagination(), "페이지네이션 정보가 null이 아니어야 함"),
                    () -> assertEquals(PAGE_SIZE, response.pagination().pageSize(), "페이지 크기가 일치해야 함"),
                    () -> assertFalse(response.pagination().hasNext(), "더 이상의 데이터가 없어야 함"),
                    () -> assertNull(response.pagination().nextCursor(), "다음 cursor가 null이어야 함")
            );
        }
    }
}