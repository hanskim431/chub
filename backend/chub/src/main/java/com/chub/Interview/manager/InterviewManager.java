package com.chub.Interview.manager;

import com.chub.Interview.dto.QuestionAnswerDto;
import com.chub.entity.Interview;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class InterviewManager {

    private final Map<Long, Interview> interviews = new ConcurrentHashMap<>();
    private final Map<Long, List<QuestionAnswerDto>> interviewQuestions = new ConcurrentHashMap<>();

    public void addQuestion(Long roomId, String question) {
        interviewQuestions.computeIfAbsent(roomId, id -> new ArrayList<>());

        interviewQuestions.computeIfPresent(roomId, (id, questionList) -> {
            questionList.add(QuestionAnswerDto.of(question));
            return questionList;
        });
    }

    public void addAnswer(Long roomId, String answer) {
        interviewQuestions.computeIfPresent(roomId, (id, questionList) -> {
            if (!questionList.isEmpty()) {
                QuestionAnswerDto lastQuestion = questionList.get(questionList.size() - 1);
                lastQuestion.setAnswer(answer);
            }
            return questionList;
        });
    }

    public List<QuestionAnswerDto> getQuestionAnswers(Long roomId) {
        return interviewQuestions.get(roomId);
    }

    public void saveInterview(Long roomId, Interview interview) {
        interviews.put(roomId, interview);
        interviewQuestions.putIfAbsent(roomId, new ArrayList<>());
    }

    public Optional<Interview> findInterview(Long roomId) {
        return Optional.ofNullable(interviews.get(roomId));
    }

    public void clearInterview(Long roomId) {
        interviews.remove(roomId);
        interviewQuestions.remove(roomId);
    }
}
