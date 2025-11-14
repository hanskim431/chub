package com.chub.chat.service;

import com.chub.chat.dto.response.MessageListResponse;
import com.chub.chat.dto.response.OpponentLastReadResponse;
import com.chub.chat.dto.websocket.ChatMessageRequest;
import com.chub.chat.dto.websocket.ReadReceiptRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public interface MessageService {

    MessageListResponse findByRoomIdBeforeDate(String roomId, LocalDateTime cursor, Integer pageSize);

    void sendMessage(ChatMessageRequest message, Long userId);

    void markReadReceipt(ReadReceiptRequest request, Long userId);

    OpponentLastReadResponse findOpponentLastReadTime(Long userId, String roomId);
}
