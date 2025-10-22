package com.chub.entity.vo;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyVo {
    private String specialty;  // 전문 분야 (예: "백엔드", "프론트엔드", "데이터 엔지니어링")
}
