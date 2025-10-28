package com.chub.dto.response;

import com.chub.common.PageInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(description = "면접관 목록 페이지 응답")
public record InterviewerProfilePageResponse(
        @Schema(description = "면접관 목록")
        List<InterviewerProfileListItemResponse> profiles,

        @Schema(description = "페이지 정보")
        PageInfo pageInfo
) {
    public static InterviewerProfilePageResponse from(Page<InterviewerProfileListItemResponse> page) {
        return new InterviewerProfilePageResponse(
                page.getContent(),
                PageInfo.from(page)
        );
    }
}
