package com.chub.service;

import com.chub.common.PageInfo;
import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewRequestRequest;
import com.chub.dto.response.InterviewRequestListData;
import com.chub.dto.response.InterviewRequestResponse;
import com.chub.dto.response.ReceivedInterviewRequestListData;
import com.chub.dto.response.ReceivedInterviewRequestResponse;
import com.chub.dto.response.ScheduledInterviewListData;
import com.chub.dto.response.ScheduledInterviewResponse;
import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.Resume;
import com.chub.entity.User;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.exception.interviewer.InterviewerProfileException;
import com.chub.exception.user.UserException;
import com.chub.repository.InterviewRequestRepository;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.ResumeRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewRequestServiceImpl implements InterviewRequestService {

    private final UserRepository userRepository;
    private final InterviewerProfileRepository interviewerProfileRepository;
    private final InterviewRequestRepository interviewRequestRepository;
    private final ResumeRepository resumeRepository;

    @Override
    @Transactional
    public void createInterviewRequest(Long userId, CreateInterviewRequestRequest request) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);

        // 면접관 프로필 조회
        InterviewerProfile interviewerProfile = interviewerProfileRepository.findById(request.interviewerId())
                .orElseThrow(InterviewerProfileException::notFound);

        // 중복 신청 체크 (PENDING 또는 APPROVED 상태 요청이 이미 존재하는지)
        Optional<InterviewRequest> existingRequest = interviewRequestRepository
                .findByUserIdAndInterviewerProfileIdAndStatusIn(
                        userId,
                        request.interviewerId(),
                        Arrays.asList("PENDING", "APPROVED")
                );

        if (existingRequest.isPresent()) {
            throw InterviewRequestException.duplicate();
        }

        // 면접 신청 생성
        InterviewRequest interviewRequest = InterviewRequest.of(user, interviewerProfile, request.requestMessage());
        interviewRequestRepository.save(interviewRequest);
    }

    @Override
    public PageResponse<InterviewRequestListData> getMyRequests(
            Long userId,
            String status,
            Pageable pageable
    ) {
        // 사용자 존재 확인
        if (!userRepository.existsById(userId)) {
            throw UserException.userNotFound();
        }

        // 상태 필터링 여부에 따라 조회
        Page<InterviewRequest> requestPage;
        if (status != null && !status.isBlank()) {
            requestPage = interviewRequestRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            requestPage = interviewRequestRepository.findByUserId(userId, pageable);
        }

        // DTO 변환
        List<InterviewRequestResponse> responses = requestPage.getContent().stream()
                .map(InterviewRequestResponse::from)
                .collect(Collectors.toList());

        // Wrapper로 감싸기
        InterviewRequestListData data = InterviewRequestListData.of(responses);

        // PageInfo 생성
        PageInfo pageInfo = PageInfo.from(requestPage);

        return PageResponse.success("내가 보낸 면접 신청 목록 조회 성공", data, pageInfo);
    }

    @Override
    public PageResponse<ReceivedInterviewRequestListData> getReceivedRequests(
            Long userId,
            String status,
            Pageable pageable
    ) {
        // 사용자의 면접관 프로필 조회
        InterviewerProfile interviewerProfile = interviewerProfileRepository.findByUserId(userId)
                .orElseThrow(InterviewerProfileException::notFound);

        // 상태 필터링 여부에 따라 조회
        Page<InterviewRequest> requestPage;
        if (status != null && !status.isBlank()) {
            requestPage = interviewRequestRepository.findByInterviewerProfileIdAndStatus(
                    interviewerProfile.getId(),
                    status,
                    pageable
            );
        } else {
            requestPage = interviewRequestRepository.findByInterviewerProfileId(
                    interviewerProfile.getId(),
                    pageable
            );
        }

        // DTO 변환 - 신청자(User) 정보 및 이력서 표시
        List<ReceivedInterviewRequestResponse> responses = requestPage.getContent().stream()
                .map(request -> {
                    // 신청자의 이력서 조회
                    String resumeUrl = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(request.getUser().getId())
                            .map(Resume::getPdfUrl)
                            .orElse(null);
                    return ReceivedInterviewRequestResponse.from(request, resumeUrl);
                })
                .collect(Collectors.toList());

        // Wrapper로 감싸기
        ReceivedInterviewRequestListData data = ReceivedInterviewRequestListData.of(responses);

        // PageInfo 생성
        PageInfo pageInfo = PageInfo.from(requestPage);

        return PageResponse.success("받은 면접 신청 목록 조회 성공", data, pageInfo);
    }

    @Override
    @Transactional
    public void updateRequestStatus(Long requestId, Long userId, Boolean accepted) {
        // 면접 신청 조회
        InterviewRequest request = interviewRequestRepository.findById(requestId)
                .orElseThrow(InterviewRequestException::notFound);

        // 권한 검증: 해당 면접관 프로필의 소유자만 수락/거절 가능
        Long profileOwnerId = request.getInterviewerProfile().getUser().getId();
        if (!profileOwnerId.equals(userId)) {
            throw InterviewRequestException.unauthorizedAccess();
        }

        // 상태 변경
        if (accepted) {
            request.approve();
        } else {
            request.reject();
        }
    }

    @Override
    public PageResponse<ScheduledInterviewListData> getScheduledInterviews(Long userId, Pageable pageable) {
        // 사용자 존재 확인
        if (!userRepository.existsById(userId)) {
            throw UserException.userNotFound();
        }

        // APPROVED 상태의 면접 요청 조회 (내가 신청자이거나 면접관인 경우)
        Page<InterviewRequest> scheduledRequestsPage = interviewRequestRepository
                .findScheduledInterviewsByUserId(userId, "APPROVED", pageable);

        // DTO 변환
        List<ScheduledInterviewResponse> interviews = scheduledRequestsPage.getContent().stream()
                .map(request -> {
                    // 현재 사용자가 면접관인지 판별
                    boolean isInterviewer = request.getInterviewerProfile().getUser().getId().equals(userId);

                    // 면접관일 경우에만 상대방(면접자)의 이력서 URL 조회
                    String resumeUrl = null;
                    if (isInterviewer) {
                        resumeUrl = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(request.getUser().getId())
                                .map(Resume::getPdfUrl)
                                .orElse(null);
                    }

                    return ScheduledInterviewResponse.from(request, userId, resumeUrl);
                })
                .collect(Collectors.toList());

        // Wrapper로 감싸기
        ScheduledInterviewListData data = ScheduledInterviewListData.of(interviews);

        // PageInfo 생성
        PageInfo pageInfo = PageInfo.from(scheduledRequestsPage);

        return PageResponse.success("예정된 면접 목록 조회 성공", data, pageInfo);
    }
}
