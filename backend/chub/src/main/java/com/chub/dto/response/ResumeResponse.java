package com.chub.dto.response;

import com.chub.entity.Resume;

public record ResumeResponse(
        String pdfUrl
) {
    public static ResumeResponse from(Resume resume) {
        return new ResumeResponse(resume.getPdfUrl());
    }
}
