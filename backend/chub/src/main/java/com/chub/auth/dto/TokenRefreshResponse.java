package com.chub.auth.dto;

import com.chub.auth.jwt.Token;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshResponse {
    private Token accessToken;
    private Token refreshToken;
}