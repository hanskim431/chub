package com.chub.auth.controller;

import com.chub.auth.dto.KakaoTokenResponse;
import com.chub.auth.dto.KakaoUserProfile;
import com.chub.auth.dto.TokenRefreshResponse;
import com.chub.auth.service.KakaoOAuth2Service;
import com.chub.auth.service.TokenService;
import com.chub.auth.util.CookieUtil;
import com.chub.auth.util.IdTokenValidator;
import com.chub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/oauth2/authorization/kakao")
@Tag(name = "OAuth2 API", description = "카카오 OAuth2 로그인 API")
public class KakaoOAuth2Controller {

    private static final String AUTHORIZATION_CODE_PARAM = "code";

    @Value("${app.frontend-url}")
    private String frontendUrl;
    
    @Value("${kakao.client-id}")
    private String clientId;

    private final KakaoOAuth2Service kakaoOAuth2Service;
    private final TokenService tokenService;
    private final UserService userService;

    @Operation(summary = "카카오 로그인 시작", description = "카카오 OAuth2 인증 페이지로 리다이렉트합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "302", description = "카카오 인증 페이지로 리다이렉트")
    })
    @GetMapping
    public ResponseEntity<Void> getKakaoAuthorizationUrl(HttpSession session) {
        String authorizationUrl = kakaoOAuth2Service.buildKakaoAuthorizeUrlAndSaveNonceInSession(session);

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", authorizationUrl)
                .build();
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleKakaoCallback(
            @RequestParam(AUTHORIZATION_CODE_PARAM) String code, HttpSession session, HttpServletResponse response) {
        log.info("Kakao OAuth2 callback received. authorization code: {}", code);

        // 카카오 토큰 요청 (내부에서 코드 검증)
        KakaoTokenResponse kakaoTokenResponse = kakaoOAuth2Service.fetchKakaoTokenByAuthorizationCode(code);
        
        // ID토큰 검증 (실패 시 자동으로 예외 발생)
        IdTokenValidator.validateIdTokenClaims(kakaoTokenResponse.getIdToken(), session, clientId);
        
        // sub 추출
        String kakaoSub = IdTokenValidator.getSub(kakaoTokenResponse.getIdToken());

        // 로그인 처리
        Long userId = kakaoOAuth2Service.processUserLogin(kakaoSub);

        // 신규 회원 - 회원가입 처리 후 메인 페이지로
        if (userId == null) {
            KakaoUserProfile profile = IdTokenValidator.getUserProfileFromIdToken(kakaoTokenResponse.getIdToken());
            userId = userService.registerNewUser(kakaoSub, profile);

            log.info("신규 회원 가입 완료: kakaoSub={}, userId={}", kakaoSub, userId);
        }

        // 토큰 발급 (기존 토큰 삭제 포함)
        TokenRefreshResponse tokenResponse = tokenService.issueNewTokensForUser(userId);

        CookieUtil.addRefreshTokenCookie(response, tokenResponse.getRefreshToken().getToken());
        CookieUtil.addAccessTokenCookie(response, tokenResponse.getAccessToken().getToken());

        // 메인 페이지로 리다이렉트
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", frontendUrl + "/")
                .build();
    }

}