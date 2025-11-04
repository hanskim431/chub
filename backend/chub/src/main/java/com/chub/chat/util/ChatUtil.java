package com.chub.chat.util;

import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class ChatUtil {

    public static String generateChatRoomId(Long userId1, Long userId2) {
        List<Long> userIds = orderUserIds(userId1, userId2);
        return userIds.get(0) + ":" + userIds.get(1);
    }

    public static List<Long> orderUserIds(Long userId1, Long userId2) {
        Set<Long> userIds = new TreeSet<>(List.of(userId1, userId2));
        return userIds.stream().toList();
    }
}
