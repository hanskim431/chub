package com.chub.service;

import com.chub.auth.dto.KakaoUserProfile;
import com.chub.entity.User;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public Long registerNewUser(String sub, KakaoUserProfile profile) {
        log.info("Registering new user: sub={}, nickname={}", sub, profile.getNickname());

        User newUser = User.builder()
                .sub(sub)
                .username(profile.getNickname())
                .build();

        // avatarUrl 설정 (picture가 있는 경우만)
        if (profile.getPicture() != null && !profile.getPicture().isBlank()) {
            newUser.updateProfile(profile.getNickname(), profile.getPicture(), null);
        }

        User savedUser = userRepository.save(newUser);
        log.info("Successfully registered new user: userId={}, sub={}", savedUser.getId(), sub);

        return savedUser.getId();
    }

}
