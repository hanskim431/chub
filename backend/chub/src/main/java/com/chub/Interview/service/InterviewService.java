package com.chub.Interview.service;

import com.chub.Interview.dto.InterviewRecordDetailDto;
import com.chub.Interview.dto.InterviewRecordListItemDto;
import com.chub.Interview.dto.QuestionDto;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InterviewService {

    void startInterview(Long userId);

    void endInterview(Long userId);

    /**
     * 오디오 답변 처리 (STT + 답변 저장)
     *
     * @param userId 사용자 ID
     * @param audioBytes 오디오 파일 바이트 배열
     * @return STT 변환된 텍스트
     */
    String processAudioAnswer(Long userId, byte[] audioBytes);

    /**
     * 질문 생성 (STT로 질문 텍스트 추출)
     *
     * @param userId 사용자 ID (면접관)
     * @param audioBytes 오디오 파일 바이트 배열
     * @return 생성된 질문
     */
    QuestionDto createQuestion(Long userId, byte[] audioBytes);

    /**
     * 다음 질문 선택지 생성 (꼬리질문 포함)
     *
     * @param userId 사용자 ID
     * @return 다음 질문 선택지 리스트
     */
    List<QuestionDto> getNextQuestions(Long userId);

    /**
     * 면접 기록 목록 조회 (페이징)
     *
     * @param userId 사용자 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 면접 기록 목록
     */
    Page<InterviewRecordListItemDto> getInterviewRecords(Long userId, int page, int size);

    /**
     * 면접 기록 상세 조회
     *
     * @param userId 사용자 ID
     * @param interviewId 면접 ID
     * @return 면접 기록 상세
     */
    InterviewRecordDetailDto getInterviewRecordDetail(Long userId, Long interviewId);
}
