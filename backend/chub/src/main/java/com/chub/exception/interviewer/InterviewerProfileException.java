package com.chub.exception.interviewer;

import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class InterviewerProfileException extends CustomRuntimeException {

    private InterviewerProfileException(ExceptionCode code) {
        super(code);
    }

    public static InterviewerProfileException notFound() {
        return new InterviewerProfileException(ExceptionCode.INTERVIEWER_PROFILE_NOT_FOUND);
    }

    public static InterviewerProfileException alreadyExists() {
        return new InterviewerProfileException(ExceptionCode.INTERVIEWER_PROFILE_ALREADY_EXISTS);
    }

    public static InterviewerProfileException invalidData() {
        return new InterviewerProfileException(ExceptionCode.INVALID_INTERVIEWER_PROFILE_DATA);
    }
}
