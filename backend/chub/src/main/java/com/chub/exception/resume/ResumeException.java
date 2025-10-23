package com.chub.exception.resume;

import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class ResumeException extends CustomRuntimeException {

    private ResumeException(ExceptionCode code) {
        super(code);
    }

    public static ResumeException resumeNotFound() {
        return new ResumeException(ExceptionCode.RESUME_NOT_FOUND);
    }

    public static ResumeException invalidFileType() {
        return new ResumeException(ExceptionCode.INVALID_FILE_TYPE);
    }

    public static ResumeException fileSizeExceeded() {
        return new ResumeException(ExceptionCode.FILE_SIZE_EXCEEDED);
    }

    public static ResumeException fileUploadFailed() {
        return new ResumeException(ExceptionCode.FILE_UPLOAD_FAILED);
    }
}
