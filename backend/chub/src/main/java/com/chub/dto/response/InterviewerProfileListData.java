package com.chub.dto.response;

import java.util.List;

public record InterviewerProfileListData(
        List<InterviewerProfileListItemResponse> profiles
) {
    public static InterviewerProfileListData of(List<InterviewerProfileListItemResponse> profiles) {
        return new InterviewerProfileListData(profiles);
    }
}
