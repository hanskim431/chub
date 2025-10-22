package com.chub.service;

import com.chub.auth.dto.KakaoUserProfile;

public interface UserService {

    /**
     * 신규 사용자 등록
     *
     * @param sub 카카오 사용자 고유 ID
     * @param profile 카카오 사용자 프로필 (nickname, picture)
     * @return 생성된 사용자 ID
     */
    Long registerNewUser(String sub, KakaoUserProfile profile);

}
