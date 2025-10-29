package com.chub.dto.response;

import java.util.List;

public record ReceivedInterviewRequestListData(
        List<ReceivedInterviewRequestResponse> interviewRequests
) {
    public static ReceivedInterviewRequestListData of(List<ReceivedInterviewRequestResponse> interviewRequests) {
        return new ReceivedInterviewRequestListData(interviewRequests);
    }
}
