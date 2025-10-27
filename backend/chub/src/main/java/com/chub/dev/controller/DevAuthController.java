package com.chub.dev.controller;

import com.chub.auth.dto.TokenRefreshResponse;
import com.chub.auth.service.TokenService;
import com.chub.common.CommonApiResponse;
import com.chub.dev.dto.DevTokenResponse;
import com.chub.dev.dto.DevUserCreateRequest;
import com.chub.dev.dto.DevUserResponse;
import com.chub.entity.User;
import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;
import com.chub.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/dev/auth")
@RequiredArgsConstructor
@Tag(name = "Dev Auth", description = "개발용 인증 API (프로덕션에서는 비활성화 필요)")
public class DevAuthController {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Operation(
        summary = "개발용 사용자 생성",
        description = "테스트용 사용자를 생성합니다. 이미 존재하는 sub인 경우 기존 사용자 정보를 반환합니다."
    )
    @PostMapping("/users")
    public ResponseEntity<CommonApiResponse<DevUserResponse>> createDevUser(
            @RequestBody DevUserCreateRequest request
    ) {
        log.warn("⚠개발용 사용자 생성 요청: sub={}, username={}", request.getSub(), request.getUsername());

        // 이미 존재하는지 확인
        Optional<User> existingUser = userRepository.findBySub(request.getSub());
        if (existingUser.isPresent()) {
            log.info("이미 존재하는 사용자: userId={}", existingUser.get().getId());
            return ResponseEntity.ok(CommonApiResponse.success(
                    DevUserResponse.from(existingUser.get())
            ));
        }

        // 사용자 생성
        User newUser = User.of(request.getSub(), request.getUsername());
        User savedUser = userRepository.save(newUser);

        log.info("개발용 사용자 생성 완료: userId={}, sub={}, username={}",
                savedUser.getId(), savedUser.getSub(), savedUser.getUsername());

        return ResponseEntity.ok(CommonApiResponse.success(
                DevUserResponse.from(savedUser)
        ));
    }

    @Operation(
        summary = "개발용 토큰 발급",
        description = "userId를 받아 JWT 토큰을 바로 발급합니다. 개발/테스트 환경에서만 사용하세요."
    )
    @GetMapping("/token")
    public ResponseEntity<CommonApiResponse<DevTokenResponse>> issueDevToken(
            @RequestParam Long userId
    ) {
        log.warn("⚠개발용 토큰 발급 요청: userId={}", userId);

        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomRuntimeException(ExceptionCode.USER_NOT_FOUND));

        // 토큰 발급
        TokenRefreshResponse tokenResponse = tokenService.issueNewTokensForUser(userId);

        // 응답 생성
        DevTokenResponse response = DevTokenResponse.builder()
                .accessToken(tokenResponse.getAccessToken().getToken())
                .refreshToken(tokenResponse.getRefreshToken().getToken())
                .build();

        log.info("개발용 토큰 발급 완료: userId={}, username={}", userId, user.getUsername());

        return ResponseEntity.ok(CommonApiResponse.success(response));
    }
}
