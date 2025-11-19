package com.chub.dummy;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.entity.User;
import com.chub.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev/data/interviews")
@RequiredArgsConstructor
@Tag(name = "더미 데이터 API", description = "개발용 더미 데이터 생성/삭제 API")
public class DummyInterviewController {

    private final DummyInterviewService dummyInterviewService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(
            summary = "완료된 면접 더미 데이터 생성",
            description = """
                    로그인한 사용자를 면접 대상자(interviewee)로 하여 완료된 면접 기록 5개를 생성합니다.

                    **생성 내용**:
                    - 더미 면접관(sub='dev-interviewer-') 중 랜덤 선택
                    - 각 면접관당 1개씩 총 5개 생성
                    - 각 면접마다 5-10개의 질문/답변 생성
                    - 면접 날짜: 최근 1개월 이내 랜덤
                    - 면접 시간: 9-17시 사이 랜덤
                    - 면접 길이: 30-90분 랜덤
                    - 상태: COMPLETED (완료)

                    **주의**: 먼저 POST /dev/data/interviewers 를 호출하여 면접관 더미 데이터를 생성해야 합니다.
                    """
    )
    @ApiResponse(responseCode = "201", description = "생성 성공")
    @ApiResponse(responseCode = "400", description = "더미 면접관 데이터가 없음")
    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    public ResponseEntity<CommonApiResponse<Void>> createCompletedInterviews(
            @Parameter(hidden = true) @LoginUser Long userId
    ) {
        User interviewee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        dummyInterviewService.createCompletedInterviews(interviewee);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonApiResponse.success());
    }

    @DeleteMapping
    @Operation(
            summary = "더미 면접 데이터 삭제",
            description = """
                    생성된 더미 면접 데이터를 모두 삭제합니다.

                    **삭제 대상**:
                    - 더미 면접관(sub='dev-interviewer-')의 모든 면접
                    - 해당 면접의 모든 질문/답변

                    일반 사용자가 생성한 면접 데이터는 삭제되지 않습니다.
                    """
    )
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    public ResponseEntity<CommonApiResponse<Void>> deleteCompletedInterviews() {
        dummyInterviewService.deleteCompletedInterviews();

        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
