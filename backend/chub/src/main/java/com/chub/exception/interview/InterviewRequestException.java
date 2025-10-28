package com.chub.exception.interview;

import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class InterviewRequestException extends CustomRuntimeException {

    private InterviewRequestException(ExceptionCode code) {
        super(code);
    }

    public static InterviewRequestException notFound() {
        return new InterviewRequestException(ExceptionCode.INTERVIEW_REQUEST_NOT_FOUND);
    }

    public static InterviewRequestException unauthorizedAccess() {
        return new InterviewRequestException(ExceptionCode.UNAUTHORIZED_REQUEST_ACCESS);
    }

    public static InterviewRequestException duplicate() {
        return new InterviewRequestException(ExceptionCode.DUPLICATE_INTERVIEW_REQUEST);
    }

    public static InterviewRequestException invalidStatus() {
        return new InterviewRequestException(ExceptionCode.INVALID_REQUEST_STATUS);
    }
}
