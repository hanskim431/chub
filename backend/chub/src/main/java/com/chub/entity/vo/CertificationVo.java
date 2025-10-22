package com.chub.entity.vo;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationVo {
    private String certificationName;  // 자격증명
    private Integer acquisitionYear;   // 취득년도
}
