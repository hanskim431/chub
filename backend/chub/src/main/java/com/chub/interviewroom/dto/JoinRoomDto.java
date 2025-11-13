package com.chub.interviewroom.dto;

import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.domain.InterviewRoomState;
import com.chub.interviewroom.enums.RoomStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomDto {

    private RoomStatus status;

    private OpponentDto opponent;

    private List<InterviewRoomChatMessage> chatHistory;

    private String currentQuestion; // nullable

    public static JoinRoomDto of(Long userId, InterviewRoomState roomState, OpponentDto opponent,
                                 String currentQuestion) {
        return JoinRoomDto.builder()
                .chatHistory(roomState.getChatHistory())
                .status(roomState.getStatus())
                .opponent(opponent)
                .currentQuestion(currentQuestion)
                .build();
    }
}
