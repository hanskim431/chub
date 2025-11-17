package com.chub.entity;

import com.chub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @Column(name = "requestMessage", columnDefinition = "TEXT")
    private String message;

    @Column(name = "status")
    private String status;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "duration")
    private Integer duration;

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

    public void complete() {
        this.status = "COMPLETED";
    }

    public void updateSchedule(LocalDateTime scheduledAt, Integer duration) {
        this.scheduledAt = scheduledAt;
        this.duration = duration;
    }

    /**
     * 개발용 메서드: 상태를 강제로 변경합니다.
     * 프로덕션 코드에서는 사용하지 마세요.
     */
    public void forceUpdateStatus(String status) {
        this.status = status;
    }
}
