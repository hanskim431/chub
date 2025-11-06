package com.chub.entity;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.*;
import static lombok.AccessLevel.*;
import static org.hibernate.type.SqlTypes.JSON;

import com.chub.common.BaseEntity;
import com.chub.entity.vo.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = PROTECTED)
public class InterviewerProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "interviewer_profile_id")
    private Long id;

    @OneToOne(fetch = LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company")
    private String company;

    @Column(name = "position")
    private String position;

    @Column(name = "department")
    private String department;

    @Column(name = "career_level")
    private String careerLevel;

    @Column(name = "introduction", columnDefinition = "TEXT")
    private String introduction;

    @Column(name = "total_years_of_experience")
    private Integer totalYearsOfExperience;

    @JdbcTypeCode(JSON)
    @Column(name = "languages", columnDefinition = "jsonb")
    private List<LanguageVo> languages;

    @JdbcTypeCode(JSON)
    @Column(name = "specialties", columnDefinition = "jsonb")
    private List<SpecialtyVo> specialties;

    @JdbcTypeCode(JSON)
    @Column(name = "educations", columnDefinition = "jsonb")
    private List<EducationVo> educations;

    @JdbcTypeCode(JSON)
    @Column(name = "experiences", columnDefinition = "jsonb")
    private List<ExperienceVo> experiences;

    @JdbcTypeCode(JSON)
    @Column(name = "certifications", columnDefinition = "jsonb")
    private List<CertificationVo> certifications;

    @JdbcTypeCode(JSON)
    @Column(name = "available_time_slots", columnDefinition = "jsonb")
    private List<AvailableTimeSlotVo> availableTimeSlots;

    @Column(name = "email")
    private String email;

    @Column(name = "field")
    private String field;

    @Column(name = "price")
    private Integer price;

    @Column(name = "interview_style", columnDefinition = "TEXT")
    private String interviewStyle;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Builder
    private InterviewerProfile(User user, String company, String position) {
        this.user = user;
        this.company = company;
        this.position = position;
        this.isActive = true;
    }

    public static InterviewerProfile of(User user, String company, String position) {
        return new InterviewerProfile(user, company, position);
    }

    public void updateBasicInfo(String company, String position, String department, String careerLevel) {
        this.company = company;
        this.position = position;
        this.department = department;
        this.careerLevel = careerLevel;
    }

    public void updateCompany(String company) {
        this.company = company;
    }

    public void updatePosition(String position) {
        this.position = position;
    }

    public void updateIntroduction(String introduction) {
        this.introduction = introduction;
    }

    public void updateExperience(Integer totalYearsOfExperience, List<ExperienceVo> experiences) {
        this.totalYearsOfExperience = totalYearsOfExperience;
        this.experiences = experiences;
    }

    public void updateSkills(List<LanguageVo> languages, List<SpecialtyVo> specialties) {
        this.languages = languages;
        this.specialties = specialties;
    }

    public void updateLanguages(List<LanguageVo> languages) {
        this.languages = languages;
    }

    public void updateSpecialties(List<SpecialtyVo> specialties) {
        this.specialties = specialties;
    }

    public void updateEducations(List<EducationVo> educations) {
        this.educations = educations;
    }

    public void updateCertifications(List<CertificationVo> certifications) {
        this.certifications = certifications;
    }

    public void updateAvailableTimeSlots(List<AvailableTimeSlotVo> availableTimeSlots) {
        this.availableTimeSlots = availableTimeSlots;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updateField(String field) {
        this.field = field;
    }

    public void updatePrice(Integer price) {
        this.price = price;
    }

    public void updateInterviewStyle(String interviewStyle) {
        this.interviewStyle = interviewStyle;
    }

    public void updateActivationStatus(Boolean isActive) {
        if (isActive != null) {
            this.isActive = isActive;
        }
    }
}
