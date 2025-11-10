package com.chub.chat.service;

import com.chub.chat.dto.response.MessageListResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public interface MessageService {

    MessageListResponse findByRoomIdBeforeDate(String roomId, LocalDateTime cursor, Integer pageSize);

}
