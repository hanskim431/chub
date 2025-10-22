package com.chub.entity;

import com.chub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "order_number")
    private Integer orderNumber;

    @Builder
    private Question(Interview interview, String content, Integer orderNumber) {
        this.interview = interview;
        this.content = content;
        this.orderNumber = orderNumber;
    }

    public static Question of(Interview interview, String content, Integer orderNumber) {
        return new Question(interview, content, orderNumber);
    }

    public void updateAnswer(String answer) {
        this.answer = answer;
    }

    public void updateContent(String content) {
        this.content = content;
    }
}
