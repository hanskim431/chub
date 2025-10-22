package com.chub.entity;

import com.chub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_request_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_profile_id", nullable = false)
    private InterviewerProfile interviewerProfile;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "status")
    private String status;

    @Builder
    private InterviewRequest(User user, InterviewerProfile interviewerProfile, String message) {
        this.user = user;
        this.interviewerProfile = interviewerProfile;
        this.message = message;
        this.status = "PENDING";
    }

    public static InterviewRequest of(User user, InterviewerProfile interviewerProfile, String message) {
        return new InterviewRequest(user, interviewerProfile, message);
    }

    public void approve() {
        this.status = "APPROVED";
    }

    public void reject() {
        this.status = "REJECTED";
    }

    public void cancel() {
        this.status = "CANCELLED";
    }
}
