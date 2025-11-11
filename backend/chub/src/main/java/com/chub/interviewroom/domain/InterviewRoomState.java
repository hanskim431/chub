package com.chub.interviewroom.domain;

import static com.chub.interviewroom.enums.RoomStatus.WAITING;
import static java.lang.String.format;

import com.chub.interviewroom.enums.RoomStatus;
import java.util.List;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InterviewRoomState {
    private final Long interviewRequestId;
    private final Participants participants;
    private final List<InterviewRoomChatMessage> chatHistory;
    @Default
    private RoomStatus status = WAITING;
    @Default
    private Long startTime = null;

    public void changeStatus(RoomStatus newStatus) {
        if (!this.status.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                    format("%s에서 %s로 변경할 수 없습니다.", status, newStatus)
            );
        }
        this.status = newStatus;
    }
}
