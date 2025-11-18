package com.chub.Interview.controller;

import static com.chub.interviewroom.enums.InterviewRoomChatType.SYSTEM;
import static com.chub.interviewroom.enums.InterviewRoomChatType.SYSTEM_ANSWER;
import static com.chub.interviewroom.enums.InterviewRoomChatType.SYSTEM_QUESTION;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

import com.chub.Interview.dto.InterviewRecordDetailDto;
import com.chub.Interview.dto.InterviewRecordListItemDto;
import com.chub.Interview.dto.InterviewRecordListResponse;
import com.chub.Interview.dto.NextQuestionChoicesResponse;
import com.chub.Interview.dto.QuestionDto;
import com.chub.Interview.service.InterviewService;
import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.common.PageInfo;
import com.chub.common.PageResponse;
import com.chub.interviewroom.domain.InterviewRoomChatMessage;
import com.chub.interviewroom.manager.InterviewRoomManager;
import com.chub.websocket.util.WebSocketHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
@Tag(name = "Interview", description = "면접 HTTP API")
public class InterviewHttpController {

    private final InterviewService interviewService;
    private final InterviewRoomManager interviewRoomManager;
    private final WebSocketHelper webSocketHelper;

    private static final String INTERVIEW_PREFIX = "/interview/";

    /**
     * HTTP를 통한 답변 제출 (파일 업로드)
     *
     * @param userId    인증된 사용자 ID
     * @param audioFile 오디오 파일
     * @return 처리 결과
     */
    @Operation(
            summary = "면접 답변 제출",
            description = "면접자가 오디오 파일로 답변을 제출합니다. STT 처리 후 WebSocket으로 결과를 브로드캐스트합니다."
    )
    @PostMapping("/answer-submit")
    public ResponseEntity<CommonApiResponse<String>> submitAnswer(
            @LoginUser Long userId,
            @RequestParam("audioFile") MultipartFile audioFile) {

        try {
            // 1. 사용자가 속한 방 ID 조회
            Long roomId = interviewRoomManager.joinedRoomId(userId)
                    .orElseThrow(() -> new IllegalStateException("방에 참여하지 않은 사용자입니다."));

            // 2. 면접자 권한 체크
            if (!interviewRoomManager.isInterviewee(userId, roomId)) {
                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("ERROR", "면접자만 답변을 제출할 수 있습니다.",
                                FORBIDDEN));
            }

            // 3. 파일 바이트 배열로 변환
            byte[] audioBytes = audioFile.getBytes();

            // 4. STT 처리 및 답변 저장
            String transcribedText = interviewService.processAudioAnswer(userId, audioBytes);

            // 5. InterviewRoomChatMessage 생성 (type: SYSTEM_ANSWER, message만 포함)
            InterviewRoomChatMessage chatMessage =
                    InterviewRoomChatMessage.builder()
                            .type(SYSTEM_ANSWER)
                            .message(transcribedText)
                            .createdAt(java.time.LocalDateTime.now())
                            .build();

            // 6. 채팅 히스토리에 추가
            interviewRoomManager.addChatMessage(roomId, chatMessage);

            // 7. WebSocket으로 채팅 메시지 브로드캐스트 (type: "chat-received")
            webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + roomId, "chat-received", chatMessage);

            // 8. WebSocket으로 답변 이벤트 브로드캐스트 (type: "answer")
            java.util.Map<String, String> answerData = java.util.Map.of("answer", transcribedText);
            webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + roomId, "answer", answerData);

            // 9. 면접관에게 꼬리 질문 선택지 전송
            Long opponentId = interviewRoomManager.getOpponentId(userId);
            List<QuestionDto> nextQuestions = interviewService.getNextQuestions(userId);

            if (!nextQuestions.isEmpty()) {
                // QuestionDto를 String으로 변환
                List<String> tailQuestions = nextQuestions.stream()
                        .map(QuestionDto::getQuestionText)
                        .toList();
                NextQuestionChoicesResponse choicesResponse = new NextQuestionChoicesResponse(tailQuestions);
                webSocketHelper.sendPersonalMessage(opponentId, "tail-questions", choicesResponse);
            }

            return ResponseEntity.ok(CommonApiResponse.success(transcribedText));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("ERROR", "답변 처리에 실패했습니다: " + e.getMessage(),
                            BAD_REQUEST));
        }
    }

    /**
     * 질문 생성 (오디오 파일 업로드)
     *
     * @param userId    인증된 사용자 ID (면접관)
     * @param audioFile 오디오 파일
     * @return 생성된 질문
     */
    @Operation(
            summary = "질문 생성",
            description = "면접관이 오디오 파일로 질문을 생성합니다. STT 처리 후 WebSocket으로 결과를 브로드캐스트합니다."
    )
    @PostMapping("/question-create")
    public ResponseEntity<CommonApiResponse<QuestionDto>> createQuestion(
            @LoginUser Long userId,
            @RequestParam("audioFile") MultipartFile audioFile) {

        try {
            // 1. 사용자가 속한 방 ID 조회
            Long roomId = interviewRoomManager.joinedRoomId(userId)
                    .orElseThrow(() -> new IllegalStateException("방에 참여하지 않은 사용자입니다."));

            // 2. 면접관 권한 체크
            if (!interviewRoomManager.isInterviewer(userId, roomId)) {
                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("ERROR", "면접관만 질문을 생성할 수 있습니다.",
                                FORBIDDEN));
            }

            // 3. 파일 바이트 배열로 변환
            byte[] audioBytes = audioFile.getBytes();

            // 4. STT 처리 및 질문 생성
            QuestionDto question = interviewService.createQuestion(userId, audioBytes);

            // 5. InterviewRoomChatMessage 생성 (type: SYSTEM_QUESTION, message만 포함)
            InterviewRoomChatMessage chatMessage =
                    InterviewRoomChatMessage.builder()
                            .type(SYSTEM_QUESTION)
                            .message(question.getQuestionText())
                            .createdAt(java.time.LocalDateTime.now())
                            .build();

            // 6. 채팅 히스토리에 추가
            interviewRoomManager.addChatMessage(roomId, chatMessage);

            // 7. WebSocket으로 채팅 메시지 브로드캐스트 (type: "chat-received")
            webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + roomId, "chat-received", chatMessage);

            // 8. WebSocket으로 질문 이벤트 브로드캐스트 (type: "question")
            java.util.Map<String, String> questionData = java.util.Map.of("question", question.getQuestionText());
            webSocketHelper.broadcastMessage(INTERVIEW_PREFIX + roomId, "question", questionData);

            return ResponseEntity.ok(CommonApiResponse.success(question));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("ERROR", "질문 생성에 실패했습니다: " + e.getMessage(),
                            BAD_REQUEST));
        }
    }

    /**
     * 면접 기록 목록 조회
     *
     * @param userId 인증된 사용자 ID
     * @param page   페이지 번호 (default: 1)
     * @param limit  페이지 크기 (default: 10)
     * @return 면접 기록 목록
     */
    @Operation(
            summary = "면접 기록 목록 조회",
            description = "사용자가 참여한 면접 기록 목록을 페이징하여 조회합니다."
    )
    @GetMapping("/records")
    public ResponseEntity<PageResponse<InterviewRecordListResponse>> getInterviewRecords(
            @LoginUser Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        try {
            // 1. 면접 기록 목록 조회
            Page<InterviewRecordListItemDto> recordPage = interviewService.getInterviewRecords(userId, page, limit);

            // 2. PageInfo 생성
            PageInfo pageInfo = PageInfo.from(recordPage);

            // 3. InterviewRecordListResponse로 변환
            InterviewRecordListResponse data = new InterviewRecordListResponse(recordPage.getContent());

            // 4. PageResponse 생성
            return ResponseEntity.ok(PageResponse.success("조회 성공", data, pageInfo));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(PageResponse.success("조회 실패", null, null));
        }
    }

    /**
     * 면접 기록 상세 조회
     *
     * @param userId      인증된 사용자 ID
     * @param interviewId 면접 ID
     * @return 면접 기록 상세
     */
    @Operation(
            summary = "면접 기록 상세 조회",
            description = "특정 면접 기록의 상세 정보를 조회합니다. 질문-답변 내역(transcript)을 포함합니다."
    )
    @GetMapping("/records/{id}")
    public ResponseEntity<CommonApiResponse<InterviewRecordDetailDto>> getInterviewRecordDetail(
            @LoginUser Long userId,
            @PathVariable("id") Long interviewId) {

        try {
            // 1. 면접 기록 상세 조회
            InterviewRecordDetailDto detail = interviewService.getInterviewRecordDetail(userId, interviewId);

            return ResponseEntity.ok(CommonApiResponse.success(detail));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("ERROR", "면접 기록 조회에 실패했습니다: " + e.getMessage(),
                            BAD_REQUEST));
        }
    }
}
