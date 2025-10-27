package com.chub.dev.dto;

import com.chub.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevUserResponse {

    private Long userId;
    private String sub;
    private String username;

    public static DevUserResponse from(User user) {
        return DevUserResponse.builder()
                .userId(user.getId())
                .sub(user.getSub())
                .username(user.getUsername())
                .build();
    }
}
