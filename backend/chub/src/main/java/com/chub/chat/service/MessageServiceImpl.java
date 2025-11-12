package com.chub.chat.service;

import com.chub.chat.dto.response.MessageDto;
import com.chub.chat.dto.response.*;
import com.chub.chat.dto.response.PaginationDto;
import com.chub.chat.dto.websocket.ChatMessageResponse;
import com.chub.chat.dto.websocket.ChatMessageRequest;
import com.chub.entity.ChatRoom;
import com.chub.entity.Message;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
import com.chub.repository.UserRepository;
import com.chub.repository.mongo.ChatRoomRepository;
import com.chub.repository.mongo.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chub.websocket.util.WebSocketHelper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private static final String ROOM_DESTINATION = "/chat/rooms/";
    private static final String MESSAGE_RECEIVED = "message.received";

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private WebSocketHelper webSocketHelper;

    @Transactional(readOnly = true)
    @Override
    public MessageListResponse findByRoomIdBeforeDate(
            String roomId, LocalDateTime cursor, Integer pageSize
    ) {
        ChatRoom room = getChatRoom(roomId);

        List<User> users = userRepository.findAllById(List.copyOf(room.getParticipantIds()));
        Map<String, ParticipantDto> participantDtoMap = createParticipantDtoMap(users);

        Pageable pageable = PageRequest.of(0, pageSize + 1);
        List<Message> messages = messageRepository.findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                roomId, cursor, pageable);
        List<MessageDto> messageDtos = createMessageDtoList(messages, pageSize);

        PaginationDto paginationDto = createPaginationDto(messages, pageSize);

        return MessageListResponse.of(roomId, messageDtos, participantDtoMap, paginationDto);
    }

    @Override
    public void sendMessage(ChatMessageRequest chatMessageRequest, Long userId) {
        String roomId = chatMessageRequest.roomId();

        Message message = Message.of(roomId, userId, chatMessageRequest.content());
        Message save = messageRepository.save(message);
        ChatMessageResponse response = ChatMessageResponse.from(save);

        notifyMessageRecipients(roomId, userId, response);
    }

    private void notifyMessageRecipients(String roomId, Long senderId, ChatMessageResponse response) {
        List<Long> recipientIds = chatRoomService.getParticipantsByRoomIdsExcludeSender(roomId, senderId);

        recipientIds.forEach(receiverId ->
                webSocketHelper.sendPersonalMessage(receiverId, MESSAGE_RECEIVED, response)
        );

        webSocketHelper.broadcastMessage(ROOM_DESTINATION + roomId, MESSAGE_RECEIVED, response);
    }

    private ChatRoom getChatRoom(String roomId) {
        Optional<ChatRoom> roomOptional = chatRoomRepository.findByRoomId(roomId);
        if (roomOptional.isEmpty()) {
            throw ChatException.chatRoomNotFound();
        }
        return roomOptional.get();
    }

    private Map<String, ParticipantDto> createParticipantDtoMap(List<User> users) {
        return users.stream().collect(
                Collectors.toMap(user -> String.valueOf(user.getId()), ParticipantDto::from));
    }

    private List<MessageDto> createMessageDtoList(List<Message> messages, int pageSize) {
        return messages.stream()
                .limit(pageSize)
                .map(MessageDto::from)
                .toList();
    }

    private PaginationDto createPaginationDto(List<Message> messages, int pageSize) {
        boolean hasNext = messages.size() > pageSize;
        LocalDateTime nextCursor = hasNext ? messages.getFirst().getCreatedAt().plusNanos(1) : null;
        return PaginationDto.of(pageSize, hasNext, nextCursor);
    }

}
