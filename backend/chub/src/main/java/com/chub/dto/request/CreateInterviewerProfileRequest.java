package com.chub.dto.request;

import com.chub.entity.vo.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "면접관 프로필 생성 요청")
public record CreateInterviewerProfileRequest(
        @Schema(description = "이름", example = "김민준")
        @NotBlank(message = "이름은 필수입니다")
        String name,

        @Schema(description = "이메일", example = "minjun.kim@example.com")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        @NotBlank(message = "이메일은 필수입니다")
        String email,

        @Schema(description = "프로필 이미지 URL", example = "https://...")
        String avatar,

        @Schema(description = "전문 분야", example = "소프트웨어 엔지니어링")
        @NotBlank(message = "전문 분야는 필수입니다")
        String field,

        @Schema(description = "회사명", example = "네이버")
        String company,

        @Schema(description = "직책", example = "시니어 개발자")
        String position,

        @Schema(description = "소개")
        String bio,

        @Schema(description = "경력 사항")
        List<ExperienceDto> experiences,

        @Schema(description = "전문 기술")
        List<String> specialties,

        @Schema(description = "학력")
        List<EducationDto> education,

        @Schema(description = "자격증")
        List<CertificationDto> certifications,

        @Schema(description = "사용 언어")
        List<String> languages,

        @Schema(description = "면접 스타일")
        String interviewStyle,

        @Schema(description = "가능 시간대")
        List<String> availableTimeSlots,

        @Schema(description = "가격", example = "80000")
        @Min(value = 0, message = "가격은 0 이상이어야 합니다")
        Integer price
) {
    public List<ExperienceVo> toExperienceVos() {
        if (experiences == null) {
            return Collections.emptyList();
        }
        return experiences.stream()
                .map(dto -> ExperienceVo.builder()
                        .companyName(dto.company())
                        .startYear(dto.startedYear())
                        .endYear(parseEndYear(dto.endedYear()))
                        .position(dto.role())
                        .description(null) // API 명세에 description 없음
                        .build())
                .collect(Collectors.toList());
    }

    public List<SpecialtyVo> toSpecialtyVos() {
        if (specialties == null) {
            return Collections.emptyList();
        }
        return specialties.stream()
                .map(specialty -> new SpecialtyVo(specialty))
                .collect(Collectors.toList());
    }

    public List<EducationVo> toEducationVos() {
        if (education == null) {
            return Collections.emptyList();
        }
        return education.stream()
                .map(dto -> EducationVo.builder()
                        .schoolName(dto.school())
                        .major(null) // API 명세에 major 없음
                        .degree(dto.role())
                        .status(null) // API 명세에 status 없음
                        .graduationYear(dto.endedYear())
                        .build())
                .collect(Collectors.toList());
    }

    public List<CertificationVo> toCertificationVos() {
        if (certifications == null) {
            return Collections.emptyList();
        }
        return certifications.stream()
                .map(dto -> new CertificationVo(dto.name(), dto.year()))
                .collect(Collectors.toList());
    }

    public List<LanguageVo> toLanguageVos() {
        if (languages == null) {
            return Collections.emptyList();
        }
        return languages.stream()
                .map(lang -> new LanguageVo(lang))
                .collect(Collectors.toList());
    }

    public List<AvailableTimeSlotVo> toAvailableTimeSlotVos() {
        if (availableTimeSlots == null) {
            return Collections.emptyList();
        }
        return availableTimeSlots.stream()
                .map(slot -> new AvailableTimeSlotVo(slot))
                .collect(Collectors.toList());
    }

    private Integer parseEndYear(String endedYear) {
        if (endedYear == null || "재직중".equals(endedYear)) {
            return null;
        }
        try {
            return Integer.parseInt(endedYear);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Schema(description = "경력 정보")
    public record ExperienceDto(
            @Schema(description = "회사명", example = "네이버")
            String company,

            @Schema(description = "시작 년도", example = "2020")
            Integer startedYear,

            @Schema(description = "종료 년도 또는 재직 상태", example = "재직중")
            String endedYear,

            @Schema(description = "역할/직책", example = "백엔드 개발자")
            String role
    ) {}

    @Schema(description = "학력 정보")
    public record EducationDto(
            @Schema(description = "학교명", example = "서울대학교 컴퓨터공학과")
            String school,

            @Schema(description = "시작 년도", example = "2000")
            Integer startedYear,

            @Schema(description = "종료 년도", example = "2003")
            Integer endedYear,

            @Schema(description = "학위/역할", example = "학사")
            String role
    ) {}

    @Schema(description = "자격증 정보")
    public record CertificationDto(
            @Schema(description = "자격증명", example = "AWS Certified Solutions Architect")
            String name,

            @Schema(description = "취득 년도", example = "2004")
            Integer year
    ) {}
}
