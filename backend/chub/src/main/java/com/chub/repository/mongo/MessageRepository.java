package com.chub.repository.mongo;

import com.chub.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByRoomIdAndCreatedAtLessThanOrderByCreatedAtDesc(
            String roomId, LocalDateTime cursorDate, Pageable pageable
    );

    int countByRoomIdAndCreatedAtGreaterThan(String roomId, LocalDateTime lastReadAt);

}
