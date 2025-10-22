package com.chub.auth.jwt;

import com.chub.entity.User;
import com.chub.exception.token.TokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Header;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.time.Duration;
import java.util.Date;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenProvider {

    @Value("${jwt.secret-key}")
    private String jwtSecretKey;

    @Value("${jwt.ACCESS_TOKEN_MINUTE_TIME}")
    private int accessTokenExpireMinutes;

    @Getter
    @Value("${jwt.REFRESH_TOKEN_MINUTE_TIME}")
    private int refreshTokenExpireMinutes;

    public Token generateAccessToken(User user) {
        return generateToken(user, accessTokenExpireMinutes);
    }

    public Token generateRefreshToken(User user) {
        return generateToken(user, refreshTokenExpireMinutes);
    }

    public Token generateToken(User user, int minutes) {
        Duration expiredAt = Duration.ofMinutes(minutes);
        Date now = new Date();
        String token = makeToken(user, new Date(now.getTime() + expiredAt.toMillis()));
        log.debug("Generated JWT for userId={}, expiresAt={}", user.getId(),
                new Date(now.getTime() + expiredAt.toMillis()));
        return new Token(token);
    }

    private String makeToken(User user, Date expiry) {
        Date now = new Date();
        return Jwts.builder()
                .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .claim("userId", user.getId())
                .claim("nickName", user.getUsername())
                .signWith(SignatureAlgorithm.HS256, jwtSecretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        log.debug("JWT 토큰 유효성 검사 시작");
        Claims claims = Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(token).getBody();
        log.debug("JWT 유효함");
        return true;
    }

    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(token).getBody();
            log.info("JWT claims 파싱 결과: {}", claims);
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            log.error("JWT에서 userId 추출 실패: {}", e.getMessage(), e);
            throw TokenException.invalidToken();
        }
    }
    
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(token).getBody();
            return claims.get("nickName", String.class);
        } catch (Exception e) {
            log.error("JWT에서 username 추출 실패: {}", e.getMessage(), e);
            throw TokenException.invalidToken();
        }
    }

}