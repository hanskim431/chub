package com.chub.chat.service;

import com.chub.chat.dto.response.ChatRoomListResponse;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.chat.util.ChatUtil;
import com.chub.entity.ChatRoom;
import com.chub.entity.User;
import com.chub.exception.chat.ChatException;
import com.chub.exception.user.UserException;
import com.chub.repository.mongo.ChatRoomRepository;
import com.chub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ChatRoomServiceImpl implements ChatRoomService {

    private final static int ZERO = 0;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public CreateChatRoomResponse findOrCreateChatRoom(Long userId, Long opponent) {
        validateUserId(userId, opponent);

        String chatRoomId = ChatUtil.generateChatRoomId(userId, opponent);

        Optional<ChatRoom> byId =
                chatRoomRepository.findByRoomId(chatRoomId);

        if (byId.isPresent()) {
            return CreateChatRoomResponse.from(byId.get());
        }

        ChatRoom chatRoom = generateNewChatRoom(userId, opponent);
        chatRoomRepository.save(chatRoom);

        return CreateChatRoomResponse.from(chatRoom);
    }

    @Transactional(readOnly = true)
    @Override
    public ChatRoomListResponse findAllChatRoom(Long userId) {
        Optional<List<ChatRoom>> optionalChatRooms =
                chatRoomRepository.findByParticipantIdsContainingOrderByUpdatedAtDesc(userId);

        if (optionalChatRooms.isEmpty()) {
            return ChatRoomListResponse.from(List.of(), userId, Map.of());
        }

        List<ChatRoom> chatRooms = optionalChatRooms.get();

        Set<Long> opponentIds
                = chatRooms.stream()
                .flatMap(room -> room.getParticipantIds().stream())
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());


        Map<Long, User> opponentMap =
                userRepository.findAllById(opponentIds)
                        .stream()
                        .collect(Collectors
                                .toMap(User::getId, Function.identity()));

        return ChatRoomListResponse.from(chatRooms, userId, opponentMap);
    }

    private ChatRoom generateNewChatRoom(Long userId, Long opponent) {
        String roomId = ChatUtil.generateChatRoomId(userId, opponent);
        List<Long> participantIds = ChatUtil.orderUserIds(userId, opponent);

        Map<Long, ChatRoom.ParticipantInfo> participants =
                Map.of(
                        participantIds.getFirst(), generateParticipantInfo(),
                        participantIds.getLast(), generateParticipantInfo()
                );

        return ChatRoom.builder()
                .roomId(roomId)
                .participantIds(participantIds)
                .participants(participants)
                .lastMessage(null)
                .build();
    }

    private ChatRoom.ParticipantInfo generateParticipantInfo() {
        return ChatRoom.ParticipantInfo.builder()
                .unreadCount(ZERO)
                .lastReadMessageId(null)
                .build();

    }

    private void validateUserId(Long userId, Long opponent) {
        validateNull(userId, opponent);
        validateEqual(userId, opponent);
        validateValidUser(opponent);
    }

    private void validateNull(Long userId, Long opponent) {
        if (userId == null || opponent == null) {
            throw UserException.invalidUserFormat();
        }
    }

    private void validateEqual(Long userId, Long opponent) {
        if (userId.equals(opponent)) {
            throw ChatException.selfChatNotAllowed();
        }
    }

    private void validateValidUser(Long opponent) {
        Optional<User> byId = userRepository.findById(opponent);
        if (byId.isEmpty() || byId.get().getIsDeleted()) {
            throw UserException.userNotFound();
        }
    }
}
