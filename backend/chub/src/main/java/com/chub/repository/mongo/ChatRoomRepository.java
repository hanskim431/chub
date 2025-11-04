package com.chub.repository.mongo;

import com.chub.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    Optional<ChatRoom> findByRoomIdContainingOrderByUpdatedAtDesc(String chatRoomId);

}