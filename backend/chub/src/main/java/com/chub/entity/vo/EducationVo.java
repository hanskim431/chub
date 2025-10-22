package com.chub.entity.vo;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationVo {
    private String schoolName;      // 학교명
    private String major;            // 전공
    private String degree;           // 학위 (학사, 석사, 박사 등)
    private String status;           // 재학/졸업 상태
    private Integer graduationYear;  // 졸업년도
}
