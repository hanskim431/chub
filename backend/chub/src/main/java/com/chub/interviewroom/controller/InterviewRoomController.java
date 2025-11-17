package com.chub.interviewroom.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.common.CommonApiResponse;
import com.chub.interviewroom.dto.JoinRoomDto;
import com.chub.interviewroom.service.InterviewRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Interview Room", description = "면접 방 관리 API")
public class InterviewRoomController {

    private final InterviewRoomService interviewRoomService;

    @Operation(
            summary = "면접 방 입장",
            description = "면접 방에 입장합니다. 방 상태, 상대방 정보, 채팅 히스토리, 현재 질문을 반환합니다."
    )
    @PostMapping("/rooms/{interviewRequestId}")
    public ResponseEntity<CommonApiResponse<JoinRoomDto>> joinRoom(@LoginUser Long userId,
                                                                   @PathVariable Long interviewRequestId) {

        JoinRoomDto dto = interviewRoomService.joinRoom(userId, interviewRequestId);

        return ResponseEntity.ok(CommonApiResponse.success(dto));
    }

    @Operation(
            summary = "면접 방 퇴장",
            description = "면접 방에서 퇴장합니다. 퇴장 이벤트가 WebSocket을 통해 브로드캐스트됩니다."
    )
    @DeleteMapping("/rooms/{interviewRequestId}")
    public ResponseEntity<CommonApiResponse<Void>> exitRoom(@LoginUser Long userId,
                                                            @PathVariable Long interviewRequestId) {

        interviewRoomService.exitRoom(userId, interviewRequestId);

        return ResponseEntity.ok(CommonApiResponse.success());
    }
}
