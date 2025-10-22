package com.chub.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomRuntimeException extends RuntimeException {
    private final ExceptionCode exceptionCode;

    public CustomRuntimeException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
    }

    public int getCode() {
        return exceptionCode.getCode();
    }

    public String getExceptionMessage() {
        return exceptionCode.getMessage();
    }

    public HttpStatus getStatus() {
        return exceptionCode.getStatus();
    }
}