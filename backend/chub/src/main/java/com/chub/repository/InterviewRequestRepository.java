package com.chub.repository;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRequestRepository extends JpaRepository<InterviewRequest, Long> {

    List<InterviewRequest> findByUser(User user);

    List<InterviewRequest> findByInterviewerProfile(InterviewerProfile interviewerProfile);

    List<InterviewRequest> findByUserId(Long userId);

    List<InterviewRequest> findByInterviewerProfileId(Long interviewerProfileId);

    List<InterviewRequest> findByStatus(String status);

    long countByUserIdAndStatus(Long userId, String status);

    long countByInterviewerProfileIdAndStatus(Long interviewerProfileId, String status);

    long countByUserIdAndStatusOrInterviewerProfileIdAndStatus(
            Long userId, String status1, Long interviewerProfileId, String status2
    );

    // ==== 면접 신청 관리 API용 쿼리 메서드 ====

    /**
     * 중복 신청 체크용: 특정 사용자가 특정 면접관에게 보낸 특정 상태들의 요청 조회
     */
    Optional<InterviewRequest> findByUserIdAndInterviewerProfileIdAndStatusIn(
            Long userId,
            Long interviewerProfileId,
            List<String> statuses
    );

    /**
     * 내가 보낸 면접 신청 목록 조회 (페이징)
     */
    Page<InterviewRequest> findByUserId(Long userId, Pageable pageable);

    /**
     * 내가 보낸 면접 신청 목록 조회 (상태 필터링, 페이징)
     */
    Page<InterviewRequest> findByUserIdAndStatus(Long userId, String status, Pageable pageable);

    /**
     * 면접관이 받은 면접 신청 목록 조회 (페이징)
     */
    Page<InterviewRequest> findByInterviewerProfileId(Long interviewerProfileId, Pageable pageable);

    /**
     * 면접관이 받은 면접 신청 목록 조회 (상태 필터링, 페이징)
     */
    Page<InterviewRequest> findByInterviewerProfileIdAndStatus(
            Long interviewerProfileId,
            String status,
            Pageable pageable
    );

    /**
     * 예정된 면접 조회: 특정 상태이면서 내가 관련된 요청들
     * (내가 신청자이거나 면접관인 경우)
     */
    @Query("SELECT ir FROM InterviewRequest ir " +
           "LEFT JOIN FETCH ir.user " +
           "LEFT JOIN FETCH ir.interviewerProfile ip " +
           "LEFT JOIN FETCH ip.user " +
           "WHERE ir.status = :status " +
           "AND (ir.user.id = :userId OR ip.user.id = :userId)")
    List<InterviewRequest> findScheduledInterviewsByUserId(
            @Param("userId") Long userId,
            @Param("status") String status
    );

    /**
     * 예정된 면접 조회 (페이징): 특정 상태이면서 내가 관련된 요청들
     * (내가 신청자이거나 면접관인 경우)
     */
    @Query("SELECT ir FROM InterviewRequest ir " +
           "LEFT JOIN ir.user u " +
           "LEFT JOIN ir.interviewerProfile ip " +
           "LEFT JOIN ip.user ipu " +
           "WHERE ir.status = :status " +
           "AND (u.id = :userId OR ipu.id = :userId)")
    Page<InterviewRequest> findScheduledInterviewsByUserId(
            @Param("userId") Long userId,
            @Param("status") String status,
            Pageable pageable
    );

    /**
     * 특정 상태의 면접 개수 조회: 내가 신청자이거나 면접관인 경우
     * (interviewerProfile.user.id로 비교)
     */
    @Query("SELECT COUNT(ir) FROM InterviewRequest ir " +
           "LEFT JOIN ir.interviewerProfile ip " +
           "WHERE ir.status = :status " +
           "AND (ir.user.id = :userId OR ip.user.id = :userId)")
    long countByUserIdOrInterviewerUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") String status
    );

    /**
     * 면접관 프로필의 소유자 ID로 받은 요청 개수 조회
     * (interviewerProfile.user.id로 비교)
     */
    @Query("SELECT COUNT(ir) FROM InterviewRequest ir " +
           "LEFT JOIN ir.interviewerProfile ip " +
           "WHERE ip.user.id = :userId AND ir.status = :status")
    long countByInterviewerUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") String status
    );
}
