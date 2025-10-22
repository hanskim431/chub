package com.chub.repository;

import com.chub.entity.InterviewRequest;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRequestRepository extends JpaRepository<InterviewRequest, Long> {

    List<InterviewRequest> findByUser(User user);

    List<InterviewRequest> findByInterviewerProfile(InterviewerProfile interviewerProfile);

    List<InterviewRequest> findByUserId(Long userId);

    List<InterviewRequest> findByInterviewerProfileId(Long interviewerProfileId);

    List<InterviewRequest> findByStatus(String status);
}
