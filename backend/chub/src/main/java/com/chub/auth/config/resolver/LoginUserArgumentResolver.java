package com.chub.auth.config.resolver;

import com.chub.auth.annotation.LoginUser;
import com.chub.auth.security.CustomUserDetails;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.server.ResponseStatusException;

@Component
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        boolean isLoginUserAnnotation = parameter.getParameterAnnotation(LoginUser.class) != null;
        boolean isLongType =
                Long.class.equals(parameter.getParameterType()) || long.class.equals(parameter.getParameterType());
        return isLoginUserAnnotation && isLongType;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {

        LoginUser loginUserAnnotation = parameter.getParameterAnnotation(LoginUser.class);
        boolean required = loginUserAnnotation.required();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // 인증 정보가 없는 경우
        if (authentication == null || !authentication.isAuthenticated()) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            } else {
                return null; // 선택적 로그인인 경우 null 반환
            }
        }

        Object principal = authentication.getPrincipal();

        // CustomUserDetails에서 userId 추출
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        // 인증 정보는 있지만 userId를 추출할 수 없는 경우
        if (required) {
            throw new IllegalStateException("인증 정보에서 userId를 추출할 수 없습니다. Principal 타입: " + principal.getClass().getName());
        } else {
            return null; // 선택적 로그인인 경우 null 반환
        }
    }
}
