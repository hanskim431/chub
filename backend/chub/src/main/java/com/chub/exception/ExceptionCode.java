package com.chub.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ExceptionCode {

    // ==== 1000번대: User 관련 ====
    USER_NOT_FOUND(1001, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_ACCESS(1002, "인증이 필요합니다.", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1003, "접근이 거부되었습니다.", HttpStatus.FORBIDDEN),
    INVALID_USER_FORMAT(1004, "잘못된 사용자 ID 형식입니다.", HttpStatus.BAD_REQUEST),
    NOT_LOGGED_IN(1005, "로그인이 필요합니다.", HttpStatus.BAD_REQUEST),
    NICKNAME_ALREADY_EXISTS(1006, "이미 사용 중인 닉네임입니다.", HttpStatus.CONFLICT),

    // ==== 2000번대: OAuth2/인증 관련 ====
    MISSING_AUTHORIZATION_CODE(2001, "인가코드가 필요합니다.", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_PRINCIPAL_TYPE(2002, "지원하지 않는 principal 타입입니다.", HttpStatus.BAD_REQUEST),
    INVALID_ID_TOKEN(2003, "ID 토큰 검증에 실패했습니다.", HttpStatus.UNAUTHORIZED),
    KAKAO_TOKEN_FETCH_FAILED(2004, "카카오 토큰 발급에 실패했습니다.", HttpStatus.BAD_GATEWAY),
    KAKAO_JWKS_FETCH_FAILED(2005, "카카오 공개키 조회에 실패했습니다.", HttpStatus.BAD_GATEWAY),
    ID_TOKEN_SUB_EXTRACTION_FAILED(2006, "ID 토큰에서 사용자 정보 추출에 실패했습니다.", HttpStatus.BAD_REQUEST),
    ID_TOKEN_SIGNATURE_INVALID(2007, "ID 토큰 서명이 유효하지 않습니다.", HttpStatus.UNAUTHORIZED),
    ID_TOKEN_PROCESSING_FAILED(2008, "ID 토큰 처리에 실패했습니다.", HttpStatus.BAD_REQUEST),

    // ==== 3000번대: JWT/Token 관련 ====
    INVALID_TEMP_TOKEN(3001, "유효하지 않은 임시 토큰입니다.", HttpStatus.UNAUTHORIZED),
    EXPIRED_TEMP_TOKEN(3002, "만료된 임시 토큰입니다.", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN_TYPE(3003, "잘못된 토큰 타입입니다.", HttpStatus.BAD_REQUEST),
    TEMP_TOKEN_PARSING_FAILED(3004, "임시 토큰 파싱에 실패했습니다.", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(3005, "유효하지 않은 토큰입니다.", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_FOUND(3006, "리프레시 토큰을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    REFRESH_TOKEN_EXPIRED(3007, "리프레시 토큰이 만료되었습니다.", HttpStatus.UNAUTHORIZED),
    TOKEN_GENERATION_FAILED(3008, "토큰 생성에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==== 4000번대: Resume 관련 ====
    RESUME_NOT_FOUND(4001, "이력서를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INVALID_FILE_TYPE(4002, "PDF 파일만 업로드 가능합니다.", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED(4003, "파일 크기는 10MB를 초과할 수 없습니다.", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(4004, "파일 업로드 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==== 5000번대: InterviewerProfile 관련 ====
    INTERVIEWER_PROFILE_NOT_FOUND(5001, "면접관 프로필을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INTERVIEWER_PROFILE_ALREADY_EXISTS(5002, "이미 면접관 프로필이 존재합니다.", HttpStatus.BAD_REQUEST),
    INVALID_INTERVIEWER_PROFILE_DATA(5003, "유효하지 않은 면접관 프로필 데이터입니다.", HttpStatus.BAD_REQUEST),

    // ==== 6000번대: InterviewRequest 관련 ====
    INTERVIEW_REQUEST_NOT_FOUND(6001, "면접 요청을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_REQUEST_ACCESS(6002, "요청에 대한 권한이 없습니다.", HttpStatus.FORBIDDEN),
    DUPLICATE_INTERVIEW_REQUEST(6003, "이미 신청한 면접관입니다.", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_STATUS(6004, "유효하지 않은 요청 상태입니다.", HttpStatus.BAD_REQUEST),

    // ==== 9000번대: External API 관련 ====
    EXTERNAL_API_ERROR(9001, "외부 API 호출 중 오류가 발생했습니다.", HttpStatus.BAD_GATEWAY),
    EXTERNAL_API_TIMEOUT(9002, "외부 API 응답 시간이 초과되었습니다.", HttpStatus.GATEWAY_TIMEOUT),
    EXTERNAL_API_SERVICE_UNAVAILABLE(9003, "외부 API 서비스를 사용할 수 없습니다.", HttpStatus.SERVICE_UNAVAILABLE),

    // ===== 10000번대: Chat 관련 ====
    SELF_CHAT_NOT_ALLOWED(10001, "자기 자신을 채팅 상대로 할 수 없습니다.", HttpStatus.BAD_REQUEST);


    private final int code;
    private final String message;
    private final HttpStatus status;

    ExceptionCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}