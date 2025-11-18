package com.chub.dummy.interviewers;

import com.chub.common.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev/data/interviewers")
@RequiredArgsConstructor
@Tag(name = "더미 데이터 API", description = "개발용 더미 데이터 생성/삭제 API")
public class DummyInterviewerController {

    private final DummyInterviewerService dummyInterviewerService;

    @PostMapping
    @Operation(
            summary = "더미 면접관 데이터 생성",
            description = "10명의 다양한 면접관 프로필을 생성합니다. 개발 및 테스트용으로만 사용하세요."
    )
    @ApiResponse(responseCode = "201", description = "생성 성공")
    public ResponseEntity<CommonApiResponse<Void>> createDummyInterviewers() {
        dummyInterviewerService.createDummyInterviewers();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonApiResponse.success());
    }

    @DeleteMapping
    @Operation(
            summary = "더미 면접관 데이터 삭제",
            description = "생성된 더미 면접관 데이터를 모두 삭제합니다 (sub이 'dev-interviewer-'로 시작하는 것만)."
    )
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    public ResponseEntity<CommonApiResponse<Void>> deleteDummyInterviewers() {
        dummyInterviewerService.deleteDummyInterviewers();
        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
