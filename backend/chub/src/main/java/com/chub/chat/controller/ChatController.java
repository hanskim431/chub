package com.chub.chat.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.chat.dto.request.CreateChatRoomRequest;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.chat.service.ChatRoomService;
import com.chub.common.CommonApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatRoomService chatRoomService;

    @PostMapping("/rooms/create")
    public ResponseEntity<CommonApiResponse<CreateChatRoomResponse>> findOrCreateChatRoom(
            @LoginUser Long userId,
            @RequestBody CreateChatRoomRequest request
    ) {
        CreateChatRoomResponse response = chatRoomService.findOrCreateChatRoom(userId, request.getOpponentId());
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

}
