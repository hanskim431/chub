package com.chub.exception.external;


import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class ExternalApiException extends CustomRuntimeException {

    public ExternalApiException(String message) {
        super(ExceptionCode.EXTERNAL_API_ERROR);
    }

    public ExternalApiException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }
}