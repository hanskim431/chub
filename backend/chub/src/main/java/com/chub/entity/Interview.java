package com.chub.entity;

import com.chub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Interview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_profile_id", nullable = false)
    private InterviewerProfile interviewerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "title")
    private String title;

    @Column(name = "status")
    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Builder
    private Interview(InterviewerProfile interviewerProfile, Resume resume, String title) {
        this.interviewerProfile = interviewerProfile;
        this.resume = resume;
        this.title = title;
        this.status = "PENDING";
    }

    public static Interview of(InterviewerProfile interviewerProfile, Resume resume, String title) {
        return new Interview(interviewerProfile, resume, title);
    }

    public void updateStatus(String status) {
        this.status = status;
    }

    public void start() {
        this.status = "IN_PROGRESS";
        this.startedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = "COMPLETED";
        this.endedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = "CANCELLED";
    }

}
