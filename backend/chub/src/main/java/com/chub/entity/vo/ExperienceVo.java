package com.chub.entity.vo;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceVo {
    private String companyName;     // 회사명
    private Integer startYear;      // 시작년도
    private String position;        // 직책/직무
    private String description;     // 업무 설명
    private Integer endYear;        // 종료년도 (null이면 현재 재직중)
}
