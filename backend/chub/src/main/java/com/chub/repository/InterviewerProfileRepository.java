package com.chub.repository;

import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewerProfileRepository extends JpaRepository<InterviewerProfile, Long> {

    Optional<InterviewerProfile> findByUser(User user);

    Optional<InterviewerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Page<InterviewerProfile> findByDepartmentContaining(String department, Pageable pageable);

    Page<InterviewerProfile> findByFieldContaining(String field, Pageable pageable);

    // isActive=true인 면접관 조회 (자기 자신 제외)
    Page<InterviewerProfile> findByIsActiveTrueAndUserIdNot(Long userId, Pageable pageable);

    // field 필터링 + isActive=true + 자기 자신 제외
    Page<InterviewerProfile> findByFieldContainingAndIsActiveTrueAndUserIdNot(String field, Long userId, Pageable pageable);

    // 더미 데이터용: sub가 특정 문자열로 시작하는 활성화된 면접관 조회
    java.util.List<InterviewerProfile> findByUser_SubStartingWithAndIsActiveTrue(String subPrefix);
}
