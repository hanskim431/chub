package com.chub.interviewroom.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.interviewroom.dto.JoinRoomDto;
import com.chub.interviewroom.service.InterviewRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewRoomController {

    private final InterviewRoomService interviewRoomService;

    @PostMapping("/rooms/{interviewRequestId}")
    public ResponseEntity<CommonApiResponse<JoinRoomDto>> joinRoom(@LoginUser Long userId,
                                                                   @PathVariable Long interviewRequestId) {

        JoinRoomDto dto = interviewRoomService.joinRoom(userId, interviewRequestId);

        return ResponseEntity.ok(CommonApiResponse.success(dto));
    }

    @DeleteMapping("/rooms/{interviewRequestId}")
    public ResponseEntity<CommonApiResponse<Void>> exitRoom(@LoginUser Long userId,
                                                            @PathVariable Long interviewRequestId) {

        interviewRoomService.exitRoom(userId, interviewRequestId);

        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
