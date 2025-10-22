package com.chub.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;

/**
 * 페이징 응답 구조
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PageResponse<T>(
        boolean success,
        String status,
        T data,
        PageInfo pageInfo,
        LocalDateTime timestamp
) {
    public static <T> PageResponse<T> success(String message, T content, PageInfo pageInfo) {
        return new PageResponse<>(true, message, content, pageInfo, LocalDateTime.now());
    }

    /**
     * Spring Data Page 객체로부터 PageResponse 생성
     */
    public static <T> PageResponse<List<T>> of(Page<T> page) {
        PageInfo pageInfo = PageInfo.from(page);

        return new PageResponse<>(
                true,
                "조회 성공",
                page.getContent(),
                pageInfo,
                LocalDateTime.now()
        );
    }
}