package com.chub.repository;

import com.chub.entity.Interview;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByInterviewerProfile(InterviewerProfile interviewerProfile);

    List<Interview> findByResume(Resume resume);

    List<Interview> findByInterviewerProfileId(Long interviewerProfileId);

    List<Interview> findByResumeId(Long resumeId);
}
