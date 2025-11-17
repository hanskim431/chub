package com.chub.interviewroom.enums;

public enum InterviewRoomChatType {
    USER("USER"),
    SYSTEM("SYSTEM"),
    SYSTEM_QUESTION("SYSTEM_QUESTION"),
    SYSTEM_ANSWER("SYSTEM_ANSWER");

    private final String type;

    InterviewRoomChatType(String type) {
        this.type = type;
    }
}
