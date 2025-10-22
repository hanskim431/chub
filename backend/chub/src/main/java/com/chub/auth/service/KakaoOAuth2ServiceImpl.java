package com.chub.auth.service;
import static com.chub.auth.util.NonceUtil.*;
import static org.springframework.web.util.UriComponentsBuilder.fromUriString;

import com.chub.auth.dto.KakaoTokenResponse;
import com.chub.entity.User;
import com.chub.exception.auth.AuthException;
import com.chub.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class KakaoOAuth2ServiceImpl implements KakaoOAuth2Service {

    private static final String KAKAO_AUTHORIZE_BASE_URL = "https://kauth.kakao.com/oauth/authorize";
    private static final String RESPONSE_TYPE_CODE = "code";
    private static final String QUERY_PARAM_GRANT_TYPE = "authorization_code";

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-url}")
    private String redirectUri;

    @Value("${kakao.token-url}")
    private String tokenUrl;

    private final WebClient webClient;
    private final UserRepository userRepository;

    @Override
    public String buildKakaoAuthorizeUrlAndSaveNonceInSession(HttpSession session) {
        String nonce = generateNonce();
        saveNonce(session, nonce);

        return fromUriString(KAKAO_AUTHORIZE_BASE_URL)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", RESPONSE_TYPE_CODE)
                .queryParam("nonce", nonce)
                .build()
                .toUriString();
    }

    @Override
    public Long processUserLogin(String kakaoSub) {
        log.info("로그인 처리 시작");

        Optional<User> existingUser = findUserByUniqueKey(kakaoSub);

        // 신규 회원 - null 반환
        if (existingUser.isEmpty()) {
            return null;
        }

        // 기존 회원 - userId 반환
        User user = existingUser.get();
        return user.getId();
    }

    private Optional<User> findUserByUniqueKey(String kakaoSub) {
        return userRepository.findBySub(kakaoSub);
    }

    private void validateAuthorizationCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            log.warn("인가코드가 빈 값으로 들어옴");
            throw AuthException.missingAuthorizationCode();
        }
    }

    @Override
    public KakaoTokenResponse fetchKakaoTokenByAuthorizationCode(String code) {
        validateAuthorizationCode(code);
        
        log.info("토큰 요청 파라미터: grant_type=authorization_code, client_id={}, redirect_uri={}, code={}",
                clientId, redirectUri, code);

        KakaoTokenResponse response = webClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", QUERY_PARAM_GRANT_TYPE)
                        .with("client_id", clientId)
                        .with("redirect_uri", redirectUri)
                        .with("code", code)
                        .with("client_secret", clientSecret))
                .retrieve()
                .bodyToMono(KakaoTokenResponse.class)
                .block();

        log.info("토큰 응답: {}", response);
        if (response == null) {
            throw AuthException.kakaoTokenFetchFailed();
        }
        return response;
    }

}