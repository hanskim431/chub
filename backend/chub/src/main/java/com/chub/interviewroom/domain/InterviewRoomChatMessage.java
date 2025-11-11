package com.chub.interviewroom.domain;

import com.chub.interviewroom.enums.InterviewRoomChatType;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
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

    private InterviewRoomChatType type; // SYSTEM, USER

    private Long senderId;
    private String senderNickname;

    private Long receiverId;
    private String receiverNickname;

    @NotBlank
    private String message;

    private LocalDateTime createdAt;
}
