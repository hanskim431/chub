package com.chub.chat.service;

import com.chub.chat.dto.response.ChatRoomListResponse;
import com.chub.chat.dto.response.CreateChatRoomResponse;

import java.util.List;

public interface ChatRoomService {
    CreateChatRoomResponse findOrCreateChatRoom(Long userId, Long opponent);

    ChatRoomListResponse findAllChatRoom(Long userId);

    List<Long> getParticipantsByRoomIdsExcludeSender(String roomId, Long senderId);
}
