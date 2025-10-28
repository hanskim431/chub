package com.chub.entity;

import com.chub.common.BaseEntity;
import com.chub.entity.vo.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewerProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interviewer_profile_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "languages", columnDefinition = "jsonb")
    private List<LanguageVo> languages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specialties", columnDefinition = "jsonb")
    private List<SpecialtyVo> specialties;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "educations", columnDefinition = "jsonb")
    private List<EducationVo> educations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "experiences", columnDefinition = "jsonb")
    private List<ExperienceVo> experiences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "certifications", columnDefinition = "jsonb")
    private List<CertificationVo> certifications;

    @JdbcTypeCode(SqlTypes.JSON)
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

    @Builder
    private InterviewerProfile(User user, String company, String position) {
        this.user = user;
        this.company = company;
        this.position = position;
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
}
