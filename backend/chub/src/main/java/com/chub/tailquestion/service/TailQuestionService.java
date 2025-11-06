package com.chub.tailquestion.service;

import java.util.List;
import java.util.Map;

public interface TailQuestionService {

    List<String> generateTailQuestions(Map<String, String> questionAnswer);
}
