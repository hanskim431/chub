package com.chub.Interview.service;

import static com.chub.interviewroom.enums.RoomStatus.ANSWER;
import static com.chub.interviewroom.enums.RoomStatus.FINISH;
import static com.chub.interviewroom.enums.RoomStatus.QUESTION;

import com.chub.Interview.dto.InterviewRecordDetailDto;
import com.chub.Interview.dto.InterviewRecordListItemDto;
import com.chub.Interview.dto.QuestionAnswerDto;
import com.chub.Interview.dto.QuestionDto;
import com.chub.Interview.dto.TranscriptDto;
import com.chub.Interview.manager.InterviewManager;
import com.chub.entity.Interview;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.Question;
import com.chub.entity.Resume;
import com.chub.exception.interview.InterviewRequestException;
import com.chub.interviewroom.enums.RoomStatus;
import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.repository.InterviewRepository;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.ResumeRepository;
import com.chub.stt.SttClient;
import com.chub.tailquestion.service.TailQuestionService;
import com.chub.websocket.util.WebSocketHelper;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRoomManager interviewRoomManager;
    private final WebSocketHelper webSocketHelper;
    private final InterviewRepository interviewRepository;
    private final InterviewManager interviewManager;
    private final InterviewerProfileRepository interviewerProfileRepository;
    private final ResumeRepository resumeRepository;
    private final SttClient sttClient;
    private final TailQuestionService tailQuestionService;
    private final com.chub.repository.QuestionRepository questionRepository;

    private static final String INTERVIEW_PREFIX = "/interview/";

    @Override
    public void startInterview(Long userId) {

        // 유저가 방에 있느지, 어떤 방에 있는지 확인 필요
        Long roomId = interviewRoomManager.joinedRoomId(userId)
                .orElseThrow(InterviewRequestException::invalidStatus);

        Long intervieweeId = interviewRoomManager.getOpponentId(userId);

        Optional<InterviewerProfile> profile = interviewerProfileRepository.findByUserId(userId);
        if (profile.isEmpty()) {
            sendWebSocketErrorToBoth(userId, intervieweeId, "면접관 프로필을 찾을 수 업습니다.");
            return;
        }

        Optional<Resume> resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(intervieweeId);
        if (resume.isEmpty()) {
            sendWebSocketErrorToBoth(userId, intervieweeId, "등록된 면접자 이력서가 없습니다.");
            return;
        }

        try {
            updateRoomStatus(roomId, QUESTION);
        } catch (IllegalStateException e) {
            webSocketHelper.sendErrorMessage(userId, e.getMessage());
            return;
        }

        Interview interview = Interview.of(profile.get(), resume.get(),
                userId + ":" + intervieweeId + ":" + LocalDateTime.now());

        interview.start();

        interviewManager.saveInterview(roomId, interview);
    }

    @Override
    public void endInterview(Long userId) {

        Long roomId = interviewRoomManager.joinedRoomId(userId)
                .orElseThrow(InterviewRequestException::invalidStatus);

        Optional<Interview> optionalInterview = interviewManager.findInterview(roomId);
        if (optionalInterview.isEmpty()) {
            Long opponentId = interviewRoomManager.getOpponentId(userId);
            sendWebSocketErrorToBoth(userId, opponentId, "면접 정보를 찾을 수 없습니다.");
            return;
        }

        Interview interview = optionalInterview.get();

        try {
            updateRoomStatus(roomId, FINISH);
        } catch (IllegalStateException e) {
            webSocketHelper.sendErrorMessage(userId, e.getMessage());
            return;
        }

        interview.complete();

        // 면접 데이터 저장
        Interview savedInterview = interviewRepository.save(interview);

        // 질문-답변 데이터 저장
        saveQuestionAnswers(savedInterview, roomId);

        // 메모리에서 면접 데이터 정리
        interviewManager.clearInterview(roomId);
    }

    private void sendWebSocketErrorToBoth(Long userId1, Long userId2, String message) {
        webSocketHelper.sendErrorMessage(userId1, message);
        webSocketHelper.sendErrorMessage(userId2, message);
    }

    @Override
    public String processAudioAnswer(Long userId, byte[] audioBytes) {
        // 1. 사용자가 속한 방 ID 조회
        Long roomId = interviewRoomManager.joinedRoomId(userId)
                .orElseThrow(InterviewRequestException::invalidStatus);

        // 2. 면접자 권한 검증 (면접자만 답변 가능)
        Long intervieweeId = interviewRoomManager.getOpponentId(userId);

        try {
            // 3. 임시 파일 생성
            String tempFilePath = createTempAudioFile(audioBytes);

            // 4. STT 처리
            String transcribedText = sttClient.transcribe(tempFilePath);

            // 5. 답변 저장 (InterviewManager에 저장)
            interviewManager.addAnswer(roomId, transcribedText);

            // 6. 임시 파일 삭제
            deleteTempFile(tempFilePath);

            // 7. 답변 완료 후 QUESTION 상태로 변경
            updateRoomStatus(roomId, QUESTION);

            return transcribedText;

        } catch (Exception e) {
            throw InterviewRequestException.invalidStatus();
        }
    }

    @Override
    public QuestionDto createQuestion(Long userId, byte[] audioBytes) {
        // 1. 사용자가 속한 방 ID 조회
        Long roomId = interviewRoomManager.joinedRoomId(userId)
                .orElseThrow(InterviewRequestException::invalidStatus);

        try {
            // 2. 임시 파일 생성
            String tempFilePath = createTempAudioFile(audioBytes);

            // 3. STT 처리하여 질문 텍스트 추출
            String questionText = sttClient.transcribe(tempFilePath);

            // 4. 질문 저장
            interviewManager.addQuestion(roomId, questionText);

            // 5. 임시 파일 삭제
            deleteTempFile(tempFilePath);

            // 6. 질문 완료 후 ANSWER 상태로 변경
            updateRoomStatus(roomId, ANSWER);

            // 7. QuestionDto로 변환하여 반환
            return QuestionDto.builder()
                    .questionText(questionText)
                    .build();

        } catch (Exception e) {
            throw InterviewRequestException.invalidStatus();
        }
    }

    @Override
    public List<QuestionDto> getNextQuestions(Long userId) {
        // 1. 사용자가 속한 방 ID 조회
        Long roomId = interviewRoomManager.joinedRoomId(userId)
                .orElseThrow(InterviewRequestException::invalidStatus);

        // 2. 현재까지의 질문-답변 조회
        List<QuestionAnswerDto> questionAnswers = interviewManager.getQuestionAnswers(roomId);

        if (questionAnswers == null || questionAnswers.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Map 형태로 변환 (TailQuestionService 요구사항)
        Map<String, String> qaMap = new HashMap<>();
        for (QuestionAnswerDto qa : questionAnswers) {
            if (qa.getQuestion() != null && qa.getAnswer() != null) {
                qaMap.put(qa.getQuestion(), qa.getAnswer());
            }
        }

        // 4. 꼬리질문 생성
        List<String> tailQuestions = tailQuestionService.generateTailQuestions(qaMap);

        // 5. QuestionDto 리스트로 변환
        List<QuestionDto> result = new ArrayList<>();
        for (String question : tailQuestions) {
            result.add(QuestionDto.builder()
                    .questionText(question)
                    .build());
        }

        return result;
    }

    private void updateRoomStatus(Long roomId, RoomStatus newStatus) {
        interviewRoomManager.updateRoomStatus(roomId, newStatus);
        webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + roomId, "status-update", newStatus);
    }

    /**
     * 오디오 바이트 배열로 임시 WebM 파일 생성
     */
    private String createTempAudioFile(byte[] audioData) {
        try {
            Path tempFilePath = Files.createTempFile("audio_" + System.currentTimeMillis(), ".webm");

            try (FileOutputStream fos = new FileOutputStream(tempFilePath.toFile())) {
                fos.write(audioData);
            }

            return tempFilePath.toString();
        } catch (IOException e) {
            throw InterviewRequestException.invalidStatus();
        }
    }

    /**
     * 임시 파일 삭제
     */
    private void deleteTempFile(String filePath) {
        try {
            Files.deleteIfExists(Path.of(filePath));
        } catch (IOException e) {
            // 임시 파일 삭제 실패는 무시
        }
    }

    /**
     * 질문-답변 데이터를 DB에 저장
     */
    private void saveQuestionAnswers(Interview interview, Long roomId) {
        List<QuestionAnswerDto> questionAnswers = interviewManager.getQuestionAnswers(roomId);

        if (questionAnswers == null || questionAnswers.isEmpty()) {
            return;
        }

        int orderNumber = 1;
        for (QuestionAnswerDto qa : questionAnswers) {
            Question question = Question.builder()
                    .interview(interview)
                    .content(qa.getQuestion())
                    .orderNumber(orderNumber++)
                    .build();

            // 답변이 있으면 저장
            if (qa.getAnswer() != null) {
                question.updateAnswer(qa.getAnswer());
            }

            questionRepository.save(question);
        }
    }

    @Override
    public Page<InterviewRecordListItemDto> getInterviewRecords(Long userId, int page, int size) {

        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Interview> interviewPage = interviewRepository.findByUserIdWithPaging(userId, pageable);

        return interviewPage.map(interview -> InterviewRecordListItemDto.from(interview, userId));
    }

    @Override
    public InterviewRecordDetailDto getInterviewRecordDetail(Long userId, Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(InterviewRequestException::notFound);

        boolean isInterviewer = interview.getInterviewerProfile().getUser().getId().equals(userId);
        boolean isInterviewee = interview.getResume().getUser().getId().equals(userId);
        if (!isInterviewer && !isInterviewee) {
            throw InterviewRequestException.unauthorizedAccess();
        }

        List<Question> questions = questionRepository.findByInterviewOrderByOrderNumberAsc(interview);
        List<TranscriptDto> transcript = new ArrayList<>();

        Long interviewerId = interview.getInterviewerProfile().getUser().getId();
        Long intervieweeId = interview.getResume().getUser().getId();

        int transcriptId = 1;
        for (Question question : questions) {
            // 질문 추가
            transcript.add(TranscriptDto.builder()
                    .id((long) transcriptId++)
                    .speaker("interviewer")
                    .text(question.getContent())
                    .timestamp(question.getCreatedAt().toString())
                    .build());

            // 답변 추가 (답변이 있는 경우)
            if (question.getAnswer() != null) {
                transcript.add(TranscriptDto.builder()
                        .id((long) transcriptId++)
                        .speaker("interviewee")
                        .text(question.getAnswer())
                        .timestamp(question.getUpdatedAt() != null ? question.getUpdatedAt().toString()
                                : question.getCreatedAt().toString())
                        .build());
            }
        }

        // 4. DTO로 변환
        return InterviewRecordDetailDto.from(interview, userId, transcript);
    }
}
