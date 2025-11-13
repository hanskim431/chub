package com.chub.repository.mongo;

import com.chub.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    Optional<ChatRoom> findByRoomId(String chatRoomId);

    Optional<List<ChatRoom>> findByParticipantIdsContainingOrderByUpdatedAtDesc(Long userId);

    @Query("{ 'room_id': ?0 }")
    @Update("{ '$set': { 'lastMessage': ?1, 'updatedAt' : ?2 } }")
    void updateLastMessage(String roomId, String lastMessage, LocalDateTime updateAt);

    @Query("{ 'room_id': ?0, 'participants.userId': ?1 }")
    @Update("{ '$set': { 'participants.$.unreadCount': 0, 'lastReadAt': ?2 } }")
    void updateReadReceipt(String roomId, Long userId, LocalDateTime lastReadAt);


}