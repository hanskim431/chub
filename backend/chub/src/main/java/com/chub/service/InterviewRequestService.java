package com.chub.service;

import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewRequestRequest;
import com.chub.dto.response.InterviewRequestResponse;
import com.chub.dto.response.ScheduledInterviewResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InterviewRequestService {

    /**
     * 면접 신청 생성
     * @param userId 신청자 ID
     * @param request 면접 신청 요청
     */
    void createInterviewRequest(Long userId, CreateInterviewRequestRequest request);

    /**
     * 내가 보낸 면접 신청 목록 조회
     * @param userId 사용자 ID
     * @param status 상태 필터 (선택)
     * @param pageable 페이징 정보
     * @return 면접 신청 목록 페이지 응답
     */
    PageResponse<List<InterviewRequestResponse>> getMyRequests(
            Long userId,
            String status,
            Pageable pageable
    );

    /**
     * 받은 면접 신청 목록 조회 (면접관용)
     * PENDING 상태의 신청만 조회합니다.
     * @param userId 사용자 ID (면접관)
     * @param pageable 페이징 정보
     * @return 면접 신청 목록 페이지 응답
     */
    PageResponse<List<InterviewRequestResponse>> getReceivedRequests(
            Long userId,
            Pageable pageable
    );

    /**
     * 면접 신청 상태 변경 (수락/거절)
     * @param requestId 신청 ID
     * @param userId 사용자 ID (면접관)
     * @param accepted 수락 여부
     */
    void updateRequestStatus(Long requestId, Long userId, Boolean accepted);

    /**
     * 예정된 면접 목록 조회
     * @param userId 사용자 ID
     * @return 예정된 면접 목록
     */
    List<ScheduledInterviewResponse> getScheduledInterviews(Long userId);
}
