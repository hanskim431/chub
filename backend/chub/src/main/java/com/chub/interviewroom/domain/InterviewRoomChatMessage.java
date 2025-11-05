package com.chub.interviewroom.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewRoomChatMessage {
    Long senderId;
    String senderNickname;
    Long receiverId;
    String receiverNickname;
    String message;
    Long createdAt;
}
