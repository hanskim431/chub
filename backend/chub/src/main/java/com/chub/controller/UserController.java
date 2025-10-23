package com.chub.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.dto.response.UserProfileResponse;
import com.chub.common.CommonApiResponse;
import com.chub.entity.User;
import com.chub.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<CommonApiResponse<UserProfileResponse>> getUserInfo(@LoginUser Long userId) {
        User user = userService.findById(userId);
        UserProfileResponse response = UserProfileResponse.from(user);
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
