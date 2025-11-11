package com.chub.Interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TranscriptDto {
    private Long id;
    private String speaker;  // "interviewer" or "interviewee"
    private String text;
    private String timestamp;
}
