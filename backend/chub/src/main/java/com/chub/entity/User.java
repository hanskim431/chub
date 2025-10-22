package com.chub.entity;

import com.chub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String sub;

    @Column(name = "username")
    private String username;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private User(String sub, String username) {
        this.sub = sub;
        this.username = username;
        this.isDeleted = false;
    }

    public static User of(String sub, String username) {
        return new User(sub, username);
    }

    public void updateProfile(String username, String avatarUrl, String bio) {
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    public void softDelete() {
        this.isDeleted = true;
    }
}
