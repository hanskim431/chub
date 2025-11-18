package com.chub.dto.response;

import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.entity.vo.*;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "면접관 프로필 응답")
public record InterviewerProfileResponse(
        @Schema(description = "면접관 프로필 ID", example = "1")
        Long id,

        @Schema(description = "사용자 ID", example = "123")
        Long userId,

        @Schema(description = "이름", example = "김민준")
        String name,

        @Schema(description = "이메일", example = "minjun.kim@example.com")
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
        Integer price
) {
    public static InterviewerProfileResponse from(User user, InterviewerProfile profile) {
        return new InterviewerProfileResponse(
                profile.getId(),
                user.getId(),
                user.getUsername(),
                profile.getEmail(),
                user.getAvatarUrl(),
                profile.getField(),
                profile.getCompany(),
                profile.getPosition(),
                profile.getIntroduction(),
                convertExperiences(profile.getExperiences()),
                convertSpecialties(profile.getSpecialties()),
                convertEducations(profile.getEducations()),
                convertCertifications(profile.getCertifications()),
                convertLanguages(profile.getLanguages()),
                profile.getInterviewStyle(),
                convertAvailableTimeSlots(profile.getAvailableTimeSlots()),
                profile.getPrice()
        );
    }

    private static List<ExperienceDto> convertExperiences(List<ExperienceVo> experiences) {
        if (experiences == null) {
            return Collections.emptyList();
        }
        return experiences.stream()
                .map(vo -> new ExperienceDto(
                        vo.getCompanyName(),
                        vo.getStartYear(),
                        vo.getEndYear() == null ? "재직중" : vo.getEndYear().toString(),
                        vo.getPosition()
                ))
                .collect(Collectors.toList());
    }

    private static List<String> convertSpecialties(List<SpecialtyVo> specialties) {
        if (specialties == null) {
            return Collections.emptyList();
        }
        return specialties.stream()
                .map(SpecialtyVo::getSpecialty)
                .collect(Collectors.toList());
    }

    private static List<EducationDto> convertEducations(List<EducationVo> educations) {
        if (educations == null) {
            return Collections.emptyList();
        }
        return educations.stream()
                .map(vo -> new EducationDto(
                        vo.getSchoolName(),
                        null, // startedYear는 VO에 없으므로 null
                        vo.getGraduationYear(),
                        vo.getDegree()
                ))
                .collect(Collectors.toList());
    }

    private static List<CertificationDto> convertCertifications(List<CertificationVo> certifications) {
        if (certifications == null) {
            return Collections.emptyList();
        }
        return certifications.stream()
                .map(vo -> new CertificationDto(
                        vo.getCertificationName(),
                        vo.getAcquisitionYear()
                ))
                .collect(Collectors.toList());
    }

    private static List<String> convertLanguages(List<LanguageVo> languages) {
        if (languages == null) {
            return Collections.emptyList();
        }
        return languages.stream()
                .map(LanguageVo::getLanguage)
                .collect(Collectors.toList());
    }

    private static List<String> convertAvailableTimeSlots(List<AvailableTimeSlotVo> timeSlots) {
        if (timeSlots == null) {
            return Collections.emptyList();
        }
        return timeSlots.stream()
                .map(AvailableTimeSlotVo::getTimeSlot)
                .collect(Collectors.toList());
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
