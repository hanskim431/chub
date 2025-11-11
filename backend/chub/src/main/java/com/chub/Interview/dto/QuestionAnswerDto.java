package com.chub.Interview.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionAnswerDto {
    private String question;
    private String answer;

    private QuestionAnswerDto(String q) {
        this.question = q;
    }

    public static QuestionAnswerDto of(String q) {
        return new QuestionAnswerDto(q);
    }
}
