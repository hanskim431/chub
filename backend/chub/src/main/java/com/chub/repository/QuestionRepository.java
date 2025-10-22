package com.chub.repository;

import com.chub.entity.Interview;
import com.chub.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByInterview(Interview interview);

    List<Question> findByInterviewId(Long interviewId);

    List<Question> findByInterviewOrderByOrderNumberAsc(Interview interview);
}
