package com.chub.auth.service;


import com.chub.auth.dto.TokenRefreshResponse;
import com.chub.auth.jwt.Token;

public interface TokenService {
    
    Token generateAccessToken(Long userId);
    
    Token generateRefreshToken(Long userId);
    
    TokenRefreshResponse refreshTokensWithRotation(String oldRefreshToken);
    
    void deleteAllUserRefreshTokens(Long userId);
    
    Long validateRefreshTokenAndGetUserId(String refreshToken);
    
    void saveRefreshTokenForUser(Long userId, Token refreshToken);
    
    TokenRefreshResponse issueNewTokensForUser(Long userId);
}