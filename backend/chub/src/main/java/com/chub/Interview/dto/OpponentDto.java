package com.chub.Interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class OpponentDto {
    private Long id;
    private String name;
    private String avatar;
}