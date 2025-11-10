package com.chub.exception.chat;

import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class ChatException extends CustomRuntimeException {

    public ChatException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public static ChatException selfChatNotAllowed() {
        return new ChatException(ExceptionCode.SELF_CHAT_NOT_ALLOWED);
    }

    public static ChatException chatRoomNotFound() {
        return new ChatException(ExceptionCode.CHAT_ROOM_NOT_FOUND);
    }
}
