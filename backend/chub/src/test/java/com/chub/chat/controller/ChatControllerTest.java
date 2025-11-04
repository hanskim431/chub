package com.chub.chat.controller;

import com.chub.auth.security.CustomUserDetails;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.chat.service.ChatRoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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
        mockMvc.perform(post("/chat/rooms/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"opponentId\": " + OPPONENT_ID + "}")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roomId", is(CHAT_ROOM_ID)));
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

}