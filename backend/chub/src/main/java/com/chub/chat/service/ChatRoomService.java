package com.chub.chat.service;

import com.chub.chat.dto.response.CreateChatRoomResponse;

public interface ChatRoomService {
    CreateChatRoomResponse findOrCreateChatRoom(Long userId, Long opponent);
}
