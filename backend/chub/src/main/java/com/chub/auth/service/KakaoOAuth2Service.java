package com.chub.auth.service;

import com.chub.auth.dto.KakaoTokenResponse;
import jakarta.servlet.http.HttpSession;

public interface KakaoOAuth2Service {

    String buildKakaoAuthorizeUrlAndSaveNonceInSession(HttpSession session);

    Long processUserLogin(String kakaoSub);

    KakaoTokenResponse fetchKakaoTokenByAuthorizationCode(String code);
}