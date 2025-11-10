package com.chub.chat.dto.response;

import com.chub.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "상대방 정보")
public record ParticipantDto(Long id, String name, String avatar) {
    public static ParticipantDto from(User user) {
        return new ParticipantDto(user.getId(), user.getUsername(), user.getAvatarUrl());
    }
}