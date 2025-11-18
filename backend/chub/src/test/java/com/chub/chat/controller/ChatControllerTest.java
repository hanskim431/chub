package com.chub.chat.controller;

import com.chub.auth.security.CustomUserDetails;
import com.chub.chat.dto.response.*;
import com.chub.chat.service.ChatRoomService;
import com.chub.chat.service.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@DisplayName("ChatController 테스트")
class ChatControllerTest {

    private static final Long USER_ID = 1L;
    private static final Long OPPONENT_ID = 2L;
    private static final String CHAT_ROOM_ID = "1:2";
    private static final String USER_NAME = "test_user";
    private static final String USER_ROLE = "ROLE_USER";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatRoomService chatRoomService;

    @MockitoBean
    private MessageService messageService;

    @BeforeEach
    void setup() {
        setMockUser(USER_ID);
    }

    @Test
    @DisplayName("통과: 채팅방 생성 요청 시 200 OK와 함께 방 ID 반환")
    void shouldCreateChatRoom_AndReturnRoomId() throws Exception {
        // given
        CreateChatRoomResponse response = new CreateChatRoomResponse(CHAT_ROOM_ID);
        when(chatRoomService.findOrCreateChatRoom(USER_ID, OPPONENT_ID)).thenReturn(response);

        // when & then
        mockMvc.perform(post("/api/chat/rooms/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"opponentId\": " + OPPONENT_ID + "}")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)));
    }

    @Nested
    @DisplayName("메시지 조회 엔드포인트 테스트")
    class GetMessageTest {

        private final LocalDateTime BASE_TIME = LocalDateTime.of(2025, 1, 2, 3, 4);
        private final int PAGE_SIZE = 3;

        @Test
        @DisplayName("통과: roomId와 cursor로 메시지를 페이지네이션해 조회한다")
        void shouldReturnMessages_WithCursorAndPageSize() throws Exception {
            // Given: MessageListResponse 준비
            MessageListResponse response = MessageListResponse.builder()
                    .roomId(CHAT_ROOM_ID)
                    .message(List.of(
                            new MessageDto("msg1", String.valueOf(USER_ID), "message 1", BASE_TIME.minusMinutes(2)),
                            new MessageDto("msg2", String.valueOf(OPPONENT_ID), "message 2", BASE_TIME.minusMinutes(1))
                    ))
                    .participants(Map.of(
                            "1", ParticipantDto.builder().id(USER_ID).name("user1").avatar("").build(),
                            "2", ParticipantDto.builder().id(OPPONENT_ID).name("user2").avatar("").build()
                    ))
                    .pagination(new PaginationDto(PAGE_SIZE, true, BASE_TIME.minusMinutes(3)))
                    .build();

            when(messageService.findByRoomIdBeforeDate(CHAT_ROOM_ID, BASE_TIME, PAGE_SIZE))
                    .thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/chat/rooms/{roomId}/messages", CHAT_ROOM_ID)
                    .param("cursor", "2025-01-02T03:04:00Z")
                    .param("pageSize", String.valueOf(PAGE_SIZE)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)))
                    .andExpect(jsonPath("$.data.message.size()", is(2)))
                    .andExpect(jsonPath("$.data.pagination.pageSize", is(PAGE_SIZE)))
                    .andExpect(jsonPath("$.data.pagination.hasNext", is(true)))
                    .andExpect(jsonPath("$.data.pagination.nextCursor", notNullValue()))
                    .andExpect(jsonPath("$.data.participants", notNullValue()));
        }

        @Test
        @DisplayName("통과: cursor를 지정하지 않으면 현재시간을 기본값으로 사용한다")
        void shouldReturnMessages_WithoutCursor() throws Exception {
            // Given
            MessageListResponse response = MessageListResponse.builder()
                    .roomId(CHAT_ROOM_ID)
                    .message(List.of())
                    .participants(Map.of(
                            "1", ParticipantDto.builder().id(USER_ID).name("user1").avatar("").build(),
                            "2", ParticipantDto.builder().id(OPPONENT_ID).name("user2").avatar("").build()
                    ))
                    .pagination(new PaginationDto(20, false, null))
                    .build();

            lenient().when(messageService.findByRoomIdBeforeDate(anyString(), isNull(), anyInt()))
                    .thenReturn(response);

            // When & Then: cursor 없이 요청
            mockMvc.perform(get("/api/chat/rooms/{roomId}/messages", CHAT_ROOM_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)));
        }

        @Test
        @DisplayName("통과: pageSize를 지정하지 않으면 기본값 20을 사용한다")
        void shouldReturnMessages_WithDefaultPageSize() throws Exception {
            // Given
            MessageListResponse response = MessageListResponse.builder()
                    .roomId(CHAT_ROOM_ID)
                    .message(List.of())
                    .participants(Map.of(
                            "1", ParticipantDto.builder().id(USER_ID).name("user1").avatar("").build(),
                            "2", ParticipantDto.builder().id(OPPONENT_ID).name("user2").avatar("").build()
                    ))
                    .pagination(new PaginationDto(20, false, null))
                    .build();

            when(messageService.findByRoomIdBeforeDate(CHAT_ROOM_ID, BASE_TIME, 20))
                    .thenReturn(response);

            // When & Then: pageSize 없이 요청
            mockMvc.perform(get("/api/chat/rooms/{roomId}/messages", CHAT_ROOM_ID)
                    .param("cursor", "2025-01-02T03:04:00Z"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.pagination.pageSize", is(20)));
        }
    }

    private void setMockUser(Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                USER_NAME,
                List.of(new SimpleGrantedAuthority(USER_ROLE))
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Nested
    @DisplayName("상대가 마지막으로 읽은 시간 조회 테스트")
    class GetOpponentLastReadTest {

        private final LocalDateTime OPPONENT_LAST_READ_TIME = LocalDateTime.of(2025, 1, 2, 10, 30, 45);

        @Test
        @DisplayName("상대가 마지막으로 읽은 시간을 조회한다")
        void shouldReturnOpponentLastReadTime() throws Exception {
            // Given
            OpponentLastReadResponse response = new OpponentLastReadResponse(CHAT_ROOM_ID, OPPONENT_LAST_READ_TIME);
            when(messageService.findOpponentLastReadTime(USER_ID, CHAT_ROOM_ID))
                    .thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/chat/rooms/{roomId}/messages/opponent-last-read", CHAT_ROOM_ID)
                    .param("roomId", CHAT_ROOM_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)))
                    .andExpect(jsonPath("$.data.lastReadAt", notNullValue()));
        }

        @Test
        @DisplayName("lastReadAt이 null인 경우도 정상 응답한다")
        void shouldReturnOpponentLastReadTime_WhenLastReadAtIsNull() throws Exception {
            // Given: 상대가 아직 메시지를 읽지 않은 경우
            OpponentLastReadResponse response = new OpponentLastReadResponse(CHAT_ROOM_ID, null);
            when(messageService.findOpponentLastReadTime(USER_ID, CHAT_ROOM_ID))
                    .thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/chat/rooms/{roomId}/messages/opponent-last-read", CHAT_ROOM_ID)
                    .param("roomId", CHAT_ROOM_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)));
        }
    }
}
