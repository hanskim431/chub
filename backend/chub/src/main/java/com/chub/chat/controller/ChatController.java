package com.chub.chat.controller;

import com.chub.auth.annotation.LoginUser;
import com.chub.chat.dto.request.CreateChatRoomRequest;
import com.chub.chat.dto.response.ChatRoomListResponse;
import com.chub.chat.dto.response.CreateChatRoomResponse;
import com.chub.chat.dto.response.MessageListResponse;
import com.chub.chat.dto.response.OpponentLastReadResponse;
import com.chub.chat.service.ChatRoomService;
import com.chub.chat.service.MessageService;
import com.chub.common.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "채팅 API")
public class ChatController {

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private MessageService messageService;

    private final static String PAGE_SIZE = "20";

    @Operation(
            summary = "새로운 채팅방 생성",
            description = "새로운 채팅방을 생성합니다. 이미 존재하는 채팅방인 경우 기존 채팅방의 Id를 반환합니다."
    )
    @PostMapping("/rooms/create")
    public ResponseEntity<CommonApiResponse<CreateChatRoomResponse>> findOrCreateChatRoom(
            @LoginUser Long userId,
            @RequestBody CreateChatRoomRequest request
    ) {
        CreateChatRoomResponse response = chatRoomService.findOrCreateChatRoom(userId, request.getOpponentId());
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(
            summary = "채팅방 목록 조회",
            description = "채팅방의 목록과 각 채팅방의 메타 데이터를 조회합니다. \n" +
                    "채팅 상대, 마지막 메시지, 읽은 메시지 등을 확인할 수 있습니다."
    )
    @GetMapping("/rooms")
    public ResponseEntity<CommonApiResponse<ChatRoomListResponse>> getChatRoom(
            @LoginUser Long userId
    ) {
        ChatRoomListResponse response = chatRoomService.findAllChatRoom(userId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(
            summary = "메시지 목록 조회",
            description = """
                    채팅방에서 나눈 메시지의 내역을 조회합니다.\s
                    cursor-based 페이지네이션 기능을 제공합니다.\s
                    처음 요청 시 cursor 파라미터는 생략하면 최신 메시지부터 조회됩니다.\s
                    더 이전 메시지를 조회하려면 응답의 nextCursor 값을 다음 요청의 cursor 파라미터로 전달하세요.
                    """
    )
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<CommonApiResponse<MessageListResponse>> getMessageByRoomId(
            @PathVariable String roomId,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
            LocalDateTime cursor,
            @RequestParam(required = false, defaultValue = PAGE_SIZE) Integer pageSize,
            @LoginUser Long userId
    ) {
        MessageListResponse response = messageService.findByRoomIdBeforeDate(
                roomId, cursor, pageSize, userId
        );
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    @Operation(
            summary = "상대가 마지막으로 읽은 시간 조회",
            description = """
                    상대가 해당 채팅방에서의 마지막 메시지를 읽은 시간을 조회합니다.
                    해당 시간으로 각 메시지의 읽음/안 읽음 여부를 판단할 수 있습니다.
                    """
    )
    @GetMapping("/rooms/{roomId}/messages/opponent-last-read")
    public ResponseEntity<CommonApiResponse<OpponentLastReadResponse>> getOpponentLastRead(
            @LoginUser Long userId,
            @PathVariable("roomId") String roomId
    ) {
        OpponentLastReadResponse response = messageService.findOpponentLastReadTime(userId, roomId);
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

}
