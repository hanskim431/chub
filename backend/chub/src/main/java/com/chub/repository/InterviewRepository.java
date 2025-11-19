package com.chub.repository;

import com.chub.entity.Interview;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByInterviewerProfile(InterviewerProfile interviewerProfile);

    List<Interview> findByResume(Resume resume);

    List<Interview> findByInterviewerProfileId(Long interviewerProfileId);

    List<Interview> findByResumeId(Long resumeId);

    /**
     * 사용자가 참여한 면접 목록 조회 (페이징)
     * 면접관으로 참여했거나 면접자로 참여한 경우 모두 조회
     */
    @Query("SELECT i FROM Interview i " +
           "LEFT JOIN FETCH i.interviewerProfile ip " +
           "LEFT JOIN FETCH ip.user " +
           "LEFT JOIN FETCH i.resume r " +
           "LEFT JOIN FETCH r.user " +
           "WHERE ip.user.id = :userId OR r.user.id = :userId " +
           "ORDER BY i.endedAt DESC")
    Page<Interview> findByUserIdWithPaging(@Param("userId") Long userId, Pageable pageable);

    /**
     * 더미 데이터용: 면접관의 User.sub가 특정 문자열로 시작하는 면접 조회
     */
    List<Interview> findByInterviewerProfile_User_SubStartingWith(String subPrefix);
}
