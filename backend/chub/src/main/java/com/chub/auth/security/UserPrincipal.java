package com.chub.auth.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.security.Principal;

/**
 * WebSocket Principal 구현
 * convertAndSendToUser() 작동을 위한 사용자 식별자
 */
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements Principal {

    private final String userId;

    @Override
    public String getName() {
        return userId;
    }

    public Long getUserIdAsLong() {
        return Long.parseLong(userId);
    }

    @Override
    public String toString() {
        return "UserPrincipal{userId=" + userId + "}";
    }
}
