package com.chub.auth.util;

import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;

public class NonceUtil {
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();

    private static final String NONCE_KEY = "oauth2_kakao_nonce";

    public static String generateNonce() {
        byte[] nonceBytes = new byte[24];
        secureRandom.nextBytes(nonceBytes);
        return base64Encoder.encodeToString(nonceBytes);
    }

    public static void saveNonce(HttpSession session, String nonce) {
        session.setAttribute(NONCE_KEY, nonce);
    }

    public static String getNonce(HttpSession session) {
        Object nonce = session.getAttribute(NONCE_KEY);
        return nonce != null ? nonce.toString() : null;
    }
}
