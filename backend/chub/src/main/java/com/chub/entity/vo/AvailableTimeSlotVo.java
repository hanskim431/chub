package com.chub.entity.vo;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableTimeSlotVo {
    private String timeSlot;  // 가능한 시간대 (예: "월요일 10:00-12:00", "화요일 14:00-16:00")
}
