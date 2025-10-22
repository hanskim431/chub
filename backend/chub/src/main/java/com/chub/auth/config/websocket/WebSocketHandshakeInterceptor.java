package com.chub.auth.config.websocket;

import com.chub.auth.jwt.TokenProvider;
import com.chub.auth.util.CookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final TokenProvider tokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        String token = extractTokenFromCookie(request);
        if (token == null) return false;

        try {
            if (!tokenProvider.validateToken(token)) return false;

            Long userId = tokenProvider.getUserIdFromToken(token);
            String username = tokenProvider.getUsernameFromToken(token);

            attributes.put("userId", userId);
            attributes.put("username", username);
            attributes.put("authenticated", true);

            return true;
        } catch (Exception e) {

            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // Do nothing
    }

    private String extractTokenFromCookie(ServerHttpRequest request) {
        if (!(request instanceof ServletServerHttpRequest)) {
            return null;
        }

        HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
        Cookie[] cookies = servletRequest.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (CookieUtil.ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
