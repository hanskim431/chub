package com.chub.service;

import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.request.UpdateInterviewerProfileRequest;
import com.chub.dto.response.InterviewerProfileListData;
import com.chub.dto.response.InterviewerProfileListItemResponse;
import com.chub.dto.response.InterviewerProfilePageResponse;
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

    /**
     * 면접관 프로필 수정 (부분 수정 지원)
     * @param userId 사용자 ID
     * @param request 프로필 수정 요청 (null인 필드는 수정하지 않음)
     */
    void updateProfile(Long userId, UpdateInterviewerProfileRequest request);

    /**
     * 면접관 목록 조회 (페이징, 필터링)
     * @param userId 현재 로그인한 사용자 ID (자기 자신 제외용)
     * @param field 분야 필터 (선택)
     * @param page 페이지 번호 (0-based)
     * @param size 페이지 크기
     * @return 면접관 목록 페이지 응답 (isActive=true이고 자기 자신 제외)
     */
    PageResponse<InterviewerProfileListData> getInterviewerProfiles(Long userId, String field, int page, int size);

    /**
     * 면접관 상세 조회
     * @param id 면접관 프로필 ID
     * @return 면접관 상세 응답
     */
    InterviewerProfileResponse getInterviewerProfileById(Long id);
}
