package com.chub.repository;

import com.chub.entity.Resume;
import com.chub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUser(User user);

    List<Resume> findByUserId(Long userId);

    /**
     * 사용자의 가장 최신 이력서 1개 조회
     * @param userId 사용자 ID
     * @return 최신 이력서 (uploadedAt 기준 내림차순)
     */
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);
}
