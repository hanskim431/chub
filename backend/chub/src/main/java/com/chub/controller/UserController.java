package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.dto.request.UserProfileUpdateRequest;
import com.chub.dto.response.UserProfileResponse;
import com.chub.common.CommonApiResponse;
import com.chub.entity.User;
import com.chub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "사용자", description = "사용자 관련 API")

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<CommonApiResponse<UserProfileResponse>> getUserInfo(@LoginUser Long userId) {
        User user = userService.findById(userId);
        UserProfileResponse response = UserProfileResponse.from(user);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(summary = "내 정보 수정", description = "로그인한 사용자의 프로필 정보를 수정합니다. (username, email, bio)")
    @PatchMapping("/me")
    public ResponseEntity<CommonApiResponse<UserProfileResponse>> updateUserProfile(
            @LoginUser Long userId,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        User updatedUser = userService.updateUserProfile(userId, request);
        UserProfileResponse response = UserProfileResponse.from(updatedUser);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<CommonApiResponse<Void>> logout(
            @LoginUser Long userId,
            HttpServletResponse response
    ) {
        userService.logout(userId, response);
        return ResponseEntity.ok(CommonApiResponse.success());
    }

}
