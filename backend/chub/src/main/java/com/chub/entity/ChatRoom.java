package com.chub.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndexes({
    @CompoundIndex(name = "room_id_updated_idx", def = "{'room_id': 1, 'updatedAt': -1}"),
    @CompoundIndex(name = "participants_updated_idx", def = "{'participantIds': 1, 'updatedAt': -1}")
})
@Document(collection = "chatrooms")
public class ChatRoom {

    @Id
    private ObjectId id;

    @Indexed(unique = true)
    @Field("room_id")
    private String roomId;

    @Indexed
    @Field("participantIds")
    private List<Long> participantIds;

    @Field("participants")
    @Builder.Default
    private Map<String, ParticipantInfo> participants = new HashMap<>();

    @Field("lastMessage")
    private String lastMessage;

    @LastModifiedDate
    @Field("updatedAt")
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantInfo {

        @Field("unreadCount")
        private Integer unreadCount;

        @Field("lastReadMessageId")
        private ObjectId lastReadMessageId;
    }
}
