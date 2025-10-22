package com.chub.common;

import com.chub.exception.CustomRuntimeException;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Builder
public class CommonApiResponse<T> {

    private boolean success;
    private int status;
    private T data;

    // 에러 관련 필드들
    private String errorCode;
    private String errorMessage;
    private Object errorData;
    
    private LocalDateTime timestamp;

    // 성공 응답
    public static <T> CommonApiResponse<T> success(T data) {
        return success(data, HttpStatus.OK);
    }
    
    public static <T> CommonApiResponse<T> success() {
        return success(null, HttpStatus.OK);
    }
    
    public static <T> CommonApiResponse<T> success(T data, HttpStatus status) {
        return CommonApiResponse.<T>builder()
                .success(true)
                .status(status.value())
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    // CustomRuntimeException용 - ExceptionCode에서 HttpStatus 자동 추출
    public static <T> CommonApiResponse<T> error(CustomRuntimeException ex) {
        return CommonApiResponse.<T>builder()
                .success(false)
                .status(ex.getStatus().value())
                .errorCode(String.valueOf(ex.getCode()))
                .errorMessage(ex.getMessage())
                .errorData(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    // 일반 에러용
    public static <T> CommonApiResponse<T> error(String code, String message, HttpStatus status) {
        return error(code, message, null, status);
    }
    
    public static <T> CommonApiResponse<T> error(String code, String message, Object data, HttpStatus status) {
        return CommonApiResponse.<T>builder()
                .success(false)
                .status(status.value())
                .errorCode(code)
                .errorMessage(message)
                .errorData(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 하위 호환성을 위한 메서드들 (기존 코드와의 호환성)
    @Deprecated
    public static <T> CommonApiResponse<T> ok(T data) {
        return success(data);
    }

    @Deprecated
    public static <T> CommonApiResponse<T> ok(T data, String message) {
        return success(data);
    }

    @Deprecated
    public static <T> CommonApiResponse<T> fail(int status, String message) {
        return error("ERROR", message, HttpStatus.valueOf(status));
    }

    @Deprecated
    public static <T> CommonApiResponse<T> fail(int status, String message, T data) {
        return error("ERROR", message, data, HttpStatus.valueOf(status));
    }
}
