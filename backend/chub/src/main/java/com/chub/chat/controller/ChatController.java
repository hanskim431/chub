package com.chub.chat.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.chat.dto.request.CreateChatRoomRequest;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.chat.service.ChatRoomService;
import com.chub.common.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@Tag(name = "Chat", description = "채팅 API")
public class ChatController {

    @Autowired
    private ChatRoomService chatRoomService;

    @Operation(
            summary = "새로운 채팅방 생성",
            description = "새로운 채팅방을 생성합니다. 이미 존재하는 채팅방인 경우 기존 채팅방의 Id를 반환합니다."
    )
    @PostMapping("/rooms/create")
    public ResponseEntity<CommonApiResponse<CreateChatRoomResponse>> findOrCreateChatRoom(
            @LoginUser Long userId,
            @RequestBody CreateChatRoomRequest request
    ) {
        CreateChatRoomResponse response = chatRoomService.findOrCreateChatRoom(userId, request.getOpponentId());
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

}
