package com.chub.auth.repository;

import com.chub.auth.entity.RefreshToken;
import com.chub.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    List<RefreshToken> findAllByUser(User user);
}
