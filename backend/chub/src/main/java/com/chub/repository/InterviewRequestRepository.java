package com.chub.repository;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
