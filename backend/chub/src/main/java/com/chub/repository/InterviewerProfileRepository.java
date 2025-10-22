package com.chub.repository;

import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewerProfileRepository extends JpaRepository<InterviewerProfile, Long> {

    Optional<InterviewerProfile> findByUser(User user);

    Optional<InterviewerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
