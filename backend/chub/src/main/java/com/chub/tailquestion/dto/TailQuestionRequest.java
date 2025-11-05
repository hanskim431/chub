package com.chub.tailquestion.dto;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TailQuestionRequest {
    private final String model;
    private final List<Map<String, String>> messages;
}
