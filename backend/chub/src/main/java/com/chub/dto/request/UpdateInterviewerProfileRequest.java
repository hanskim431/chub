package com.chub.dto.request;

import static java.util.stream.Collectors.toList;

import com.chub.entity.vo.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;

import java.util.List;

@Schema(description = "면접관 프로필 수정 요청 (모든 필드 선택적)")
public record UpdateInterviewerProfileRequest(
        @Schema(description = "이름", example = "김민준")
        String name,

        @Schema(description = "이메일", example = "minjun.kim@example.com")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        String email,

        @Schema(description = "프로필 이미지 URL", example = "https://...")
        String avatar,

        @Schema(description = "전문 분야", example = "소프트웨어 엔지니어링")
        String field,

        @Schema(description = "회사명", example = "네이버")
        String company,

        @Schema(description = "직책", example = "시니어 개발자")
        String position,

        @Schema(description = "소개")
        String bio,

        @Schema(description = "경력 사항")
        List<CreateInterviewerProfileRequest.ExperienceDto> experiences,

        @Schema(description = "전문 기술")
        List<String> specialties,

        @Schema(description = "학력")
        List<CreateInterviewerProfileRequest.EducationDto> education,

        @Schema(description = "자격증")
        List<CreateInterviewerProfileRequest.CertificationDto> certifications,

        @Schema(description = "사용 언어")
        List<String> languages,

        @Schema(description = "면접 스타일")
        String interviewStyle,

        @Schema(description = "가능 시간대")
        List<String> availableTimeSlots,

        @Schema(description = "가격", example = "80000")
        @Min(value = 0, message = "가격은 0 이상이어야 합니다")
        Integer price,

        @Schema(description = "활성 상태", example = "true")
        Boolean isActive
) {
    public List<ExperienceVo> toExperienceVos() {
        if (experiences == null) {
            return null;
        }
        return experiences.stream()
                .map(dto -> ExperienceVo.builder()
                        .companyName(dto.company())
                        .startYear(dto.startedYear())
                        .endYear(parseEndYear(dto.endedYear()))
                        .position(dto.role())
                        .description(null)
                        .build())
                .collect(toList());
    }

    public List<SpecialtyVo> toSpecialtyVos() {
        if (specialties == null) {
            return null;
        }
        return specialties.stream()
                .map(SpecialtyVo::new)
                .collect(toList());
    }

    public List<EducationVo> toEducationVos() {
        if (education == null) {
            return null;
        }
        return education.stream()
                .map(dto -> EducationVo.builder()
                        .schoolName(dto.school())
                        .major(null)
                        .degree(dto.role())
                        .status(null)
                        .graduationYear(dto.endedYear())
                        .build())
                .collect(toList());
    }

    public List<CertificationVo> toCertificationVos() {
        if (certifications == null) {
            return null;
        }
        return certifications.stream()
                .map(dto -> new CertificationVo(dto.name(), dto.year()))
                .collect(toList());
    }

    public List<LanguageVo> toLanguageVos() {
        if (languages == null) {
            return null;
        }
        return languages.stream()
                .map(LanguageVo::new)
                .collect(toList());
    }

    public List<AvailableTimeSlotVo> toAvailableTimeSlotVos() {
        if (availableTimeSlots == null) {
            return null;
        }
        return availableTimeSlots.stream()
                .map(AvailableTimeSlotVo::new)
                .collect(toList());
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
}
