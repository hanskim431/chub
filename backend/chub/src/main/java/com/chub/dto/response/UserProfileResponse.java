package com.chub.dto.response;

import com.chub.entity.User;

public record UserProfileResponse(
        Long id,
        String name,
        String avatar
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
