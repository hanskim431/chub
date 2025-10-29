package com.chub.dto.response;

import java.util.List;

public record InterviewRequestListData(
        List<InterviewRequestResponse> interviewRequests
) {
    public static InterviewRequestListData of(List<InterviewRequestResponse> interviewRequests) {
        return new InterviewRequestListData(interviewRequests);
    }
}
