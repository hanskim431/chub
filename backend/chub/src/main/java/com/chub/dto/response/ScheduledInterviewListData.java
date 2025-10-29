package com.chub.dto.response;

import java.util.List;

public record ScheduledInterviewListData(
        List<ScheduledInterviewResponse> interviews
) {
    public static ScheduledInterviewListData of(List<ScheduledInterviewResponse> interviews) {
        return new ScheduledInterviewListData(interviews);
    }
}
