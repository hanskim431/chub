package com.chub.tailquestion.service;

import com.chub.tailquestion.client.TailQuestionClient;
import com.chub.tailquestion.dto.TailQuestionRequest;
import com.chub.tailquestion.dto.TailQuestionResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TailQuestionServiceImpl implements TailQuestionService {

    private static final String TAIL_QUESTION_SYSTEM_MESSAGE =
            "You are an interview assistant. Always generate 2 follow-up questions regarding the most recent answer. " +
                    "The questions must be highly relevant and coherent based on both the content and context of the interview. "
                    +
                    "If the most recent answer or the previous question is off-topic or unrelated to the intended interview flow, "
                    +
                    "ignore them and instead generate the 2 most suitable and contextually appropriate follow-up questions "
                    +
                    "based on the overall interview context. Do not generate any follow-up questions that are unrelated or "
                    +
                    "irrelevant to the context.\n" +
                    "The answer format must always be as follows:\n" +
                    "`방금 말씀하신 프로젝트에 대해 더 상세히 말씀해주세요.\n동시성 문제를 해결하기 위해 synchronized 키워드를 사용한다고 말씀하셨는데, 다른 방법은 없나요?`";

    private static final String DEFAULT_MODEL_NAME = "gpt-5-mini";

    private final TailQuestionClient tailQuestionClient;

    @Override
    public List<String> generateTailQuestions(Map<String, String> questionAnswer) {
        // 비즈니스 로직: TailQuestionRequest 구성
        TailQuestionRequest request = buildTailQuestionRequest(questionAnswer);

        // Client 호출
        TailQuestionResponse response = tailQuestionClient.generate(request);

        return response.getQuestions();
    }

    private TailQuestionRequest buildTailQuestionRequest(Map<String, String> questionAnswer) {
        List<Map<String, String>> messages = new ArrayList<>();

        // 시스템 메시지 추가
        messages.add(Map.of("role", "developer", "content", TAIL_QUESTION_SYSTEM_MESSAGE));

        // 질문-답변 히스토리 추가
        questionAnswer.forEach((question, answer) -> {
            messages.add(Map.of("role", "assistant", "content", question));
            messages.add(Map.of("role", "user", "content", answer));
        });

        return TailQuestionRequest.builder()
                .model(DEFAULT_MODEL_NAME)
                .messages(messages)
                .build();
    }
}
