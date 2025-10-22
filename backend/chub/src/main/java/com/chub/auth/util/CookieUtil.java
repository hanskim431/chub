package com.chub.auth.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private static int accessTokenExpireSeconds;
    private static int refreshTokenExpireSeconds;

    @Value("${jwt.ACCESS_TOKEN_MINUTE_TIME}")
    public void setAccessTokenExpireMinutes(int minutes) {
        accessTokenExpireSeconds = minutes * 60;
    }

    @Value("${jwt.REFRESH_TOKEN_MINUTE_TIME}")
    public void setRefreshTokenExpireMinutes(int minutes) {
        refreshTokenExpireSeconds = minutes * 60;
    }

    // 상수를 활용한 편의 메서드들
    public static void addAccessTokenCookie(HttpServletResponse response, String value) {
        addCookie(response, ACCESS_TOKEN_COOKIE_NAME, value, accessTokenExpireSeconds);
    }

    public static void addRefreshTokenCookie(HttpServletResponse response, String value) {
        addCookie(response, REFRESH_TOKEN_COOKIE_NAME, value, refreshTokenExpireSeconds);
    }

    // 범용 메서드 (필요시 커스텀 값 사용 가능)
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofSeconds(maxAge))
                // 도메인 설정시: .domain("domain.com")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    // 각 토큰별 삭제 메서드
    public static void deleteAccessTokenCookie(HttpServletResponse response) {
        deleteCookie(response, ACCESS_TOKEN_COOKIE_NAME);
    }

    public static void deleteRefreshTokenCookie(HttpServletResponse response) {
        deleteCookie(response, REFRESH_TOKEN_COOKIE_NAME);
    }

    // 범용 삭제 메서드
    public static void deleteCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    // 쿠키 읽기 메서드들
    public static String getRefreshTokenFromCookie(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE_NAME);
    }

    public static String getAccessTokenFromCookie(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE_NAME);
    }

    // 범용 쿠키 값 읽기 메서드
    public static String getCookieValue(HttpServletRequest request, String cookieName) {
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
}