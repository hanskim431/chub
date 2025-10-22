package com.chub.exception.auth;


import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class AuthException extends CustomRuntimeException {

    public AuthException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public static AuthException missingAuthorizationCode(){
        return new AuthException(ExceptionCode.MISSING_AUTHORIZATION_CODE);
    }

    public static AuthException invalidIdToken(){
        return new AuthException(ExceptionCode.INVALID_ID_TOKEN);
    }

    public static AuthException kakaoTokenFetchFailed(){
        return new AuthException(ExceptionCode.KAKAO_TOKEN_FETCH_FAILED);
    }

    public static AuthException kakaoJwksFetchFailed(){
        return new AuthException(ExceptionCode.KAKAO_JWKS_FETCH_FAILED);
    }

    public static AuthException idTokenSubExtractionFailed(){
        return new AuthException(ExceptionCode.ID_TOKEN_SUB_EXTRACTION_FAILED);
    }

    public static AuthException idTokenSignatureInvalid(){
        return new AuthException(ExceptionCode.ID_TOKEN_SIGNATURE_INVALID);
    }

    public static AuthException idTokenProcessingFailed(){
        return new AuthException(ExceptionCode.ID_TOKEN_PROCESSING_FAILED);
    }
}