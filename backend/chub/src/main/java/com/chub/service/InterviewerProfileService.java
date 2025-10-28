package com.chub.service;

import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.response.InterviewerProfileResponse;

public interface InterviewerProfileService {

    /**
     * 내 면접관 프로필 조회
     * @param userId 사용자 ID
     * @return 면접관 프로필 응답
     */
    InterviewerProfileResponse getMyProfile(Long userId);

    /**
     * 면접관 프로필 생성
     * @param userId 사용자 ID
     * @param request 프로필 생성 요청
     */
    void createProfile(Long userId, CreateInterviewerProfileRequest request);
}
