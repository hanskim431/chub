package com.chub.auth.util;

import com.chub.auth.dto.KakaoUserProfile;
import com.chub.exception.auth.AuthException;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URL;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class IdTokenValidator {

    private static final String ISSUER = "https://kauth.kakao.com";
    private static final String KAKAO_JWKS_URL = "https://kauth.kakao.com/.well-known/jwks.json";
    private static final long CACHE_TTL_MILLIS = 24 * 60 * 60 * 1000L; // 24시간 캐싱
    
    // 공개키 캐싱을 위한 변수
    private static JWKSet cachedJWKSet;
    private static long cacheExpiryTime;
    
    /**
     * 카카오 공개키 조회 (24시간 캐싱 적용)
     */
    static synchronized JWKSet getKakaoJWKSet() throws IOException, ParseException {
        long currentTime = System.currentTimeMillis();
        
        // 캐시가 유효한 경우 캐시된 값 반환
        if (cachedJWKSet != null && currentTime < cacheExpiryTime) {
            log.debug("Using cached Kakao JWK Set");
            return cachedJWKSet;
        }
        
        // 새로운 공개키 조회
        log.info("Fetching fresh Kakao JWK Set from {}", KAKAO_JWKS_URL);
        try {
            URL jwksURL = new URL(KAKAO_JWKS_URL);
            cachedJWKSet = JWKSet.load(jwksURL);
            cacheExpiryTime = currentTime + CACHE_TTL_MILLIS;
            log.info("Successfully cached Kakao JWK Set for 24 hours. Cache expires at: {}", new Date(cacheExpiryTime));
            return cachedJWKSet;
        } catch (Exception e) {
            log.error("Failed to fetch Kakao JWK Set", e);
            throw AuthException.kakaoJwksFetchFailed();
        }
    }

    /**
     * id_token 안에서 sub (고유 사용자 ID) 추출
     *
     * @param idToken JWT 형식의 id_token 문자열
     * @return sub 값 (사용자 고유 ID)
     * @throws AuthException 추출 실패 시 예외 발생
     */
    public static String getSub(String idToken) {
        try {
            return verifySignatureAndParseClaims(idToken).getSubject();
        } catch (Exception e) {
            throw AuthException.idTokenSubExtractionFailed();
        }
    }

    /**
     * id_token 안에서 사용자 프로필 정보 추출 (nickname, picture)
     *
     * @param idToken JWT 형식의 id_token 문자열
     * @return KakaoUserProfile (nickname, picture)
     * @throws AuthException 추출 실패 시 예외 발생
     */
    public static KakaoUserProfile getUserProfileFromIdToken(String idToken) {
        try {
            JWTClaimsSet claims = verifySignatureAndParseClaims(idToken);
            String nickname = claims.getStringClaim("nickname");
            String picture = claims.getStringClaim("picture");

            log.debug("Extracted user profile from ID token: nickname={}, picture={}", nickname, picture);
            return new KakaoUserProfile(nickname, picture);
        } catch (Exception e) {
            log.error("Failed to extract user profile from ID token", e);
            throw AuthException.idTokenSubExtractionFailed();
        }
    }

    /**
     * 카카오 ID 토큰 시그니처 및 필수 클레임 완전 검증 (카카오 공식 문서 기준)
     *
     * @param idToken          검증할 JWT id_token
     * @param session          HttpSession (nonce 확인용)
     * @param expectedClientId 클라이언트 ID (aud 검증용)
     * @throws AuthException   검증 실패 시 예외 발생
     */
    public static void validateIdTokenClaims(String idToken, HttpSession session, String expectedClientId) {
        try {
            // 1. 카카오 공개키로 서명 검증 + 클레임 파싱
            JWTClaimsSet claims = verifySignatureAndParseClaims(idToken);
            log.debug("Kakao ID token signature verification successful");

            // 2. 필수 클레임 검증
            if (!isNonceValid(claims, session)) {
                log.warn("ID token validation failed: invalid nonce");
                throw AuthException.invalidIdToken();
            }
            if (!isIssuerValid(claims)) {
                log.warn("ID token validation failed: invalid issuer. Expected: {}, Actual: {}", 
                         ISSUER, claims.getIssuer());
                throw AuthException.invalidIdToken();
            }
            if (!isAudienceValid(claims, expectedClientId)) {
                log.warn("ID token validation failed: invalid audience. Expected: {}, Actual: {}", 
                         expectedClientId, claims.getAudience());
                throw AuthException.invalidIdToken();
            }
            if (!isExpirationValid(claims)) {
                log.warn("ID token validation failed: token expired. Expiration: {}", 
                         claims.getExpirationTime());
                throw AuthException.invalidIdToken();
            }

            log.info("Kakao ID token validation successful for user: {}", claims.getSubject());
        } catch (AuthException e) {
            // AuthException은 그대로 재전파
            throw e;
        } catch (Exception e) {
            log.error("Kakao ID token validation failed", e);
            throw AuthException.invalidIdToken();
        }
    }

    /**
     * 카카오 공개키로 서명 검증 후 클레임 파싱
     */
    static JWTClaimsSet verifySignatureAndParseClaims(String idToken) throws Exception {
        try {
            // ConfigurableJWTProcessor로 서명 검증 + 클레임 파싱 한번에 처리
            ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();

            // 카카오 공개키 소스 설정
            JWKSet jwkSet = getKakaoJWKSet();
            JWKSource<SecurityContext> keySource = new ImmutableJWKSet<>(jwkSet);

            // RS256 서명 검증 키 셀렉터 설정
            JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            jwtProcessor.setJWSKeySelector(keySelector);

            // 서명 검증 + 클레임 파싱
            JWTClaimsSet claims = jwtProcessor.process(idToken, null);
            log.debug("Successfully verified Kakao ID token signature");
            return claims;
            
        } catch (BadJOSEException e) {
            log.error("Kakao ID token signature verification failed", e);
            throw AuthException.idTokenSignatureInvalid();
        } catch (JOSEException e) {
            log.error("JOSE processing error during signature verification", e);
            throw AuthException.idTokenProcessingFailed();
        }
    }

    private static boolean isNonceValid(JWTClaimsSet claims, HttpSession session) throws ParseException {
        String nonceInIdToken = claims.getStringClaim("nonce");
        String storedNonce = NonceUtil.getNonce(session);
        log.info("id_token nonce = {}, session nonce = {}", nonceInIdToken, storedNonce);
        return Objects.equals(storedNonce, nonceInIdToken);
    }

    private static boolean isIssuerValid(JWTClaimsSet claims) {
        return ISSUER.equals(claims.getIssuer());
    }

    private static boolean isAudienceValid(JWTClaimsSet claims, String expectedClientId) {
        Object audClaim = claims.getClaim("aud");

        if (audClaim == null) {
            return false;
        }
        if (audClaim instanceof String) {
            return expectedClientId.equals(audClaim);
        }
        if (audClaim instanceof List<?>) {
            return ((List<?>) audClaim).contains(expectedClientId);
        }

        // aud 클레임 타입 불일치
        return false;
    }

    private static boolean isExpirationValid(JWTClaimsSet claims) {
        Date exp = claims.getExpirationTime();
        return exp != null && new Date().before(exp);
    }

}
