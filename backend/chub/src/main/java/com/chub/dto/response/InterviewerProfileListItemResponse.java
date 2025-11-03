package com.chub.dto.response;

import com.chub.entity.InterviewerProfile;
import com.chub.entity.vo.ExperienceVo;
import com.chub.entity.vo.SpecialtyVo;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "면접관 목록 조회 응답")
public record InterviewerProfileListItemResponse(
        @Schema(description = "면접관 프로필 ID", example = "1")
        Long id,

        @Schema(description = "이름", example = "김민준")
        String name,

        @Schema(description = "아바타 URL", example = "https://...")
        String avatar,

        @Schema(description = "전문 분야", example = "소프트웨어 엔지니어링")
        String field,

        @Schema(description = "회사명", example = "네이버")
        String company,

        @Schema(description = "직급", example = "시니어 개발자")
        String position,

        @Schema(description = "소개", example = "10년 경력의 백엔드 개발자...")
        String bio,

        @Schema(description = "경력 사항")
        List<ExperienceVo> experiences,

        @Schema(description = "전문 분야")
        List<String> specialties,

        @Schema(description = "가격", example = "80000")
        Integer price
) {
    public static InterviewerProfileListItemResponse from(InterviewerProfile profile) {
        return new InterviewerProfileListItemResponse(
                profile.getId(),
                profile.getUser().getUsername(),
                profile.getUser().getAvatarUrl(),
                profile.getField(),
                profile.getCompany(),
                profile.getPosition(),
                profile.getIntroduction(),
                profile.getExperiences(),
                convertSpecialties(profile.getSpecialties()),
                profile.getPrice()
        );
    }

    private static List<String> convertSpecialties(List<SpecialtyVo> specialties) {
        if (specialties == null) {
            return Collections.emptyList();
        }
        return specialties.stream()
                .map(SpecialtyVo::getSpecialty)
                .collect(Collectors.toList());
    }
}
