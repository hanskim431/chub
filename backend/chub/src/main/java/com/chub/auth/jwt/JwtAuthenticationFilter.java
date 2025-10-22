package com.chub.auth.jwt;

import static com.chub.auth.util.CookieUtil.*;

import com.chub.auth.dto.TokenRefreshResponse;
import com.chub.auth.security.CustomUserDetails;
import com.chub.auth.service.TokenService;
import com.chub.auth.util.CookieUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final TokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractJwtFromRequest(request);

            if (token == null) {
                token = extractJwtFromCookie(request);
            }

            if (token != null) {
                try {
                    // 토큰 유효성 검사
                    if (tokenProvider.validateToken(token)) {
                        setAuthentication(token);
                    }
                } catch (ExpiredJwtException e) {
                    log.info("액세스 토큰이 만료됨. 자동 갱신 시도...");

                    // 리프레시 토큰으로 자동 갱신 시도
                    String newAccessToken = tryAutoRefreshToken(request, response);
                    if (newAccessToken != null) {
                        log.info("토큰 자동 갱신 성공");
                        setAuthentication(newAccessToken);
                    } else {
                        log.warn("토큰 자동 갱신 실패. 재로그인 필요");
                        // 갱신 실패 시 쿠키 정리
                        CookieUtil.deleteAccessTokenCookie(response);
                        CookieUtil.deleteRefreshTokenCookie(response);
                    }
                }
            } else {
                // 액세스 토큰이 없는 경우에도 리프레시 토큰으로 갱신 시도
                log.debug("액세스 토큰이 없음. 리프레시 토큰으로 갱신 시도");
                String newAccessToken = tryAutoRefreshToken(request, response);
                if (newAccessToken != null) {
                    log.info("리프레시 토큰으로 액세스 토큰 자동 발급 성공");
                    setAuthentication(newAccessToken);
                }
            }
        } catch (Exception e) {
            log.error("JWT 필터에서 예외 발생: {}", e.getMessage());
            // 예외 발생 시에도 필터 체인은 계속 진행 (인증 없는 상태로)
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String token) {
        Long userId = tokenProvider.getUserIdFromToken(token);
        String username = tokenProvider.getUsernameFromToken(token); // 토큰에서 username 추출
        
        CustomUserDetails userDetails = new CustomUserDetails(userId, username, Collections.emptyList());
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.debug("Authorization 헤더: {}", bearerToken);

        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return null;
        }

        return bearerToken.substring(7);
    }

    private String extractJwtFromCookie(HttpServletRequest request) {
        return extractTokenFromCookie(request, ACCESS_TOKEN_COOKIE_NAME);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        return extractTokenFromCookie(request, REFRESH_TOKEN_COOKIE_NAME);
    }

    private String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * 리프레시 토큰을 사용하여 액세스 토큰 자동 갱신 (RTR 적용)
     * @return 새로 발급된 액세스 토큰 문자열 (실패시 null)
     */
    private String tryAutoRefreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            String refreshToken = extractRefreshTokenFromCookie(request);
            if (refreshToken == null) {
                log.debug("리프레시 토큰이 쿠키에 없음");
                return null;
            }

            // RTR 적용: 액세스 토큰과 리프레시 토큰 모두 갱신
            TokenRefreshResponse tokenResponse = tokenService.refreshTokensWithRotation(refreshToken);
            if (tokenResponse == null) {
                log.debug("RTR 토큰 갱신 실패");
                return null;
            }

            // 새로운 토큰들을 쿠키에 설정
            CookieUtil.addAccessTokenCookie(response, tokenResponse.getAccessToken().getToken());
            CookieUtil.addRefreshTokenCookie(response, tokenResponse.getRefreshToken().getToken());

            log.info("RTR 자동 갱신 완료");
            return tokenResponse.getAccessToken().getToken(); // 토큰 문자열만 반환

        } catch (Exception e) {
            log.error("토큰 자동 갱신 중 오류: {}", e.getMessage());
            return null;
        }
    }
}