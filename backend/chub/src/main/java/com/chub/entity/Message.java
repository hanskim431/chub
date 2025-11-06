package com.chub.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "messages")
@CompoundIndexes({
    @CompoundIndex(name = "room_id_created_idx", def = "{'room_id': 1, 'created_at': -1}"),
    @CompoundIndex(name = "message_from_created_idx", def = "{'message_from': 1, 'created_at': -1}")
})
public class Message {

    @Id
    private ObjectId id;

    @Field("room_id")
    private String roomId;

    @Field("message_from")
    private Long messageFrom;

    @Field("content")
    private String content;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
