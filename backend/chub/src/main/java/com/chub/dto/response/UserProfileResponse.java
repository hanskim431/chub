package com.chub.dto.response;

import com.chub.entity.User;

public record UserProfileResponse(
        Long id,
        String name,
        String avatar,
        String email,
        String bio
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getEmail(),
                user.getBio()
        );
    }
}
