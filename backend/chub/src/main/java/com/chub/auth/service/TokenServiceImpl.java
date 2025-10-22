package com.chub.auth.service;

import com.chub.auth.dto.TokenRefreshResponse;
import com.chub.auth.entity.RefreshToken;
import com.chub.auth.jwt.Token;
import com.chub.auth.jwt.TokenProvider;
import com.chub.entity.User;
import com.chub.exception.token.TokenException;
import com.chub.exception.user.UserException;
import com.chub.auth.repository.RefreshTokenRepository;
import com.chub.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TokenServiceImpl implements TokenService {

    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    public Token generateAccessToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);
        return tokenProvider.generateAccessToken(user);
    }

    @Override
    public Token generateRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);
        return tokenProvider.generateRefreshToken(user);
    }

    @Override
    public TokenRefreshResponse refreshTokensWithRotation(String oldRefreshToken) {
        // 1. JWT 서명 검증 (위조/변조 확인)
        if (!tokenProvider.validateToken(oldRefreshToken)) {
            throw TokenException.invalidToken();
        }

        // 2. DB에서 토큰 조회
        RefreshToken oldToken = refreshTokenRepository.findByRefreshToken(oldRefreshToken)
                .orElseThrow(TokenException::refreshTokenNotFound);

        // 3. 만료 시간 검증
        if (oldToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw TokenException.refreshTokenExpired();
        }
        
        User user = oldToken.getUser();
        
        // 기존 토큰 삭제 (RTR)
        refreshTokenRepository.delete(oldToken);
        
        // 새로운 토큰들 발급
        Token newAccessToken = tokenProvider.generateAccessToken(user);
        Token newRefreshToken = tokenProvider.generateRefreshToken(user);
        saveRefreshTokenForUser(user.getId(), newRefreshToken);
        
        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public void deleteAllUserRefreshTokens(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser(user);
        refreshTokenRepository.deleteAll(tokens);
    }

    @Override
    @Transactional(readOnly = true)
    public Long validateRefreshTokenAndGetUserId(String refreshTokenValue) {
        if (!isValidRefreshTokenInput(refreshTokenValue)) {
            return null;
        }

        return refreshTokenRepository.findByRefreshToken(refreshTokenValue)
                .filter(rt -> rt.getExpirationDate().isAfter(LocalDateTime.now()))
                .filter(rt -> rt.getUser() != null)
                .map(RefreshToken::getUser)
                .map(User::getId)
                .orElse(null);
    }

    @Override
    public void saveRefreshTokenForUser(Long userId, Token refreshToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);
        int expireMinutes = tokenProvider.getRefreshTokenExpireMinutes();
        refreshTokenRepository.save(RefreshToken.builder()
                .refreshToken(refreshToken.getToken())
                .user(user)
                .expirationDate(LocalDateTime.now().plusMinutes(expireMinutes))
                .build());
    }

    @Override
    public TokenRefreshResponse issueNewTokensForUser(Long userId) {
        // 기존 토큰 모두 삭제
        deleteAllUserRefreshTokens(userId);
        
        // 새로운 토큰 발급
        Token refreshToken = generateRefreshToken(userId);
        Token accessToken = generateAccessToken(userId);
        
        // 리프레시 토큰 저장
        saveRefreshTokenForUser(userId, refreshToken);
        
        return TokenRefreshResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private boolean isValidRefreshTokenInput(String refreshTokenValue) {
        return refreshTokenValue != null && !refreshTokenValue.isBlank() && tokenProvider.validateToken(
                refreshTokenValue);
    }
}