package com.chub.dummy;

import com.chub.entity.InterviewRequest;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.repository.InterviewRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DummyInterviewRequestService {

    private final InterviewRequestRepository interviewRequestRepository;

    @Transactional
    public void forceUpdateStatus(Long id, String status) {
        log.info("면접 요청 상태 강제 변경 시작 - ID: {}, 상태: {}", id, status);

        InterviewRequest interviewRequest = interviewRequestRepository.findById(id)
                .orElseThrow(InterviewRequestException::notFound);

        String oldStatus = interviewRequest.getStatus();
        interviewRequest.forceUpdateStatus(status);

        log.info("면접 요청 상태 변경 완료 - ID: {}, 이전 상태: {}, 새 상태: {}", id, oldStatus, status);
    }
}
