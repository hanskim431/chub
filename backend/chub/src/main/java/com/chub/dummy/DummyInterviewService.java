package com.chub.dummy;

import com.chub.entity.*;
import com.chub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class DummyInterviewService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final InterviewerProfileRepository interviewerProfileRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    private final Random random = new Random();

    // 더미 질문 풀
    private static final List<String> QUESTION_POOL = List.of(
            "자기소개 부탁드립니다.",
            "지원 동기가 무엇인가요?",
            "본인의 강점과 약점을 말씀해주세요.",
            "가장 기억에 남는 프로젝트 경험을 설명해주세요.",
            "팀 프로젝트에서 갈등이 생겼을 때 어떻게 해결하셨나요?",
            "기술적으로 가장 어려웠던 문제와 해결 방법을 말씀해주세요.",
            "최근에 배운 기술이나 관심있는 기술 스택은 무엇인가요?",
            "5년 후 커리어 목표는 무엇인가요?",
            "우리 회사에 대해 알고 계신 것이 있나요?",
            "마지막으로 하고 싶으신 말씀이 있으신가요?"
    );

    // 더미 답변 풀
    private static final List<String> ANSWER_POOL = List.of(
            "저는 3년간 백엔드 개발 경험이 있으며, Spring Boot와 JPA를 주로 사용해왔습니다. 최근에는 MSA 아키텍처에 관심을 가지고 공부하고 있습니다.",
            "귀사의 기술 블로그를 보고 혁신적인 기술 스택과 개발 문화에 매료되어 지원하게 되었습니다.",
            "저의 강점은 빠른 학습 능력과 문제 해결 능력입니다. 새로운 기술을 빠르게 습득하여 프로젝트에 적용할 수 있습니다. 약점은 때때로 완벽주의 성향이 있어 일정 관리에 어려움을 겪을 수 있다는 점입니다.",
            "전자상거래 플랫폼을 개발하면서 대용량 트래픽 처리를 위해 Redis 캐싱과 DB 인덱싱을 최적화한 경험이 가장 기억에 남습니다. 응답 시간을 70% 개선할 수 있었습니다.",
            "팀원들과 의견 충돌이 있을 때는 먼저 상대방의 입장을 경청하고, 데이터와 근거를 바탕으로 논의하여 합의점을 찾아갑니다.",
            "N+1 쿼리 문제로 API 응답이 느렸던 적이 있었는데, Fetch Join과 BatchSize 설정을 통해 해결했습니다. 이 과정에서 JPA의 동작 원리를 깊이 이해하게 되었습니다.",
            "최근에는 Kotlin과 Spring WebFlux를 학습하고 있으며, 반응형 프로그래밍에 관심이 많습니다. 또한 Kubernetes를 활용한 컨테이너 오케스트레이션도 공부하고 있습니다.",
            "5년 후에는 시니어 개발자로서 후배 개발자들을 멘토링하고, 기술 아키텍처 설계에도 기여할 수 있는 개발자가 되고 싶습니다.",
            "귀사가 최근 AI 기반 추천 시스템을 도입하셨다는 기사를 봤습니다. 기술적으로 매우 흥미로운 도전이라고 생각합니다.",
            "이번 기회를 통해 귀사의 우수한 개발팀과 함께 성장하고 싶습니다. 좋은 결과 있기를 기대하겠습니다. 감사합니다."
    );

    @Transactional
    public void createCompletedInterviews(User interviewee) {
        log.info("=== 완료된 면접 더미 데이터 생성 시작 ===");
        log.info("면접 대상자: userId={}, username={}", interviewee.getId(), interviewee.getUsername());

        // 1. 면접 대상자의 Resume 확인/생성
        Resume resume = getOrCreateResume(interviewee);
        log.info("Resume 준비 완료: resumeId={}, pdfUrl={}", resume.getId(), resume.getPdfUrl());

        // 2. 더미 면접관 조회 (sub가 'dev-interviewer-'로 시작하는 프로필)
        List<InterviewerProfile> dummyInterviewers = interviewerProfileRepository
                .findByUser_SubStartingWithAndIsActiveTrue("dev-interviewer-");

        if (dummyInterviewers.isEmpty()) {
            log.warn("더미 면접관 데이터가 없습니다. 먼저 POST /dev/data/interviewers 를 호출하여 면접관 더미 데이터를 생성하세요.");
            throw new IllegalStateException("더미 면접관 데이터가 없습니다. 먼저 면접관 더미 데이터를 생성하세요.");
        }

        log.info("더미 면접관 조회 완료: {}명", dummyInterviewers.size());

        // 3. 5개의 완료된 면접 생성
        int targetCount = 5;
        int createdCount = 0;

        for (int i = 0; i < targetCount; i++) {
            // 랜덤 면접관 선택
            InterviewerProfile interviewer = dummyInterviewers.get(random.nextInt(dummyInterviewers.size()));

            // 면접 생성
            Interview interview = createCompletedInterview(interviewer, resume, interviewee);
            Interview savedInterview = interviewRepository.save(interview);

            // 질문/답변 생성 (5-10개)
            int questionCount = 5 + random.nextInt(6); // 5~10개
            createQuestionsForInterview(savedInterview, questionCount);

            createdCount++;
            log.info("면접 {}개 생성 완료: interviewId={}, interviewer={}, questionCount={}",
                    createdCount, savedInterview.getId(), interviewer.getUser().getUsername(), questionCount);
        }

        log.info("=== 완료된 면접 더미 데이터 생성 완료: 총 {}개 ===", createdCount);
    }

    @Transactional
    public void deleteCompletedInterviews() {
        log.info("=== 더미 면접 데이터 삭제 시작 ===");

        // 더미 면접관의 면접 조회 (sub가 'dev-interviewer-'로 시작)
        List<Interview> dummyInterviews = interviewRepository
                .findByInterviewerProfile_User_SubStartingWith("dev-interviewer-");

        if (dummyInterviews.isEmpty()) {
            log.info("삭제할 더미 면접 데이터가 없습니다.");
            return;
        }

        // 연관된 질문들 먼저 삭제
        int deletedQuestions = 0;
        for (Interview interview : dummyInterviews) {
            List<Question> questions = questionRepository.findByInterviewOrderByOrderNumberAsc(interview);
            questionRepository.deleteAll(questions);
            deletedQuestions += questions.size();
        }

        // 면접 삭제
        interviewRepository.deleteAll(dummyInterviews);

        log.info("=== 더미 면접 데이터 삭제 완료: 면접 {}개, 질문 {}개 ===",
                dummyInterviews.size(), deletedQuestions);
    }

    private Resume getOrCreateResume(User interviewee) {
        // 기존 Resume 조회
        Resume existingResume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(interviewee.getId())
                .orElse(null);

        if (existingResume != null) {
            return existingResume;
        }

        // Resume가 없으면 더미 생성
        String dummyPdfUrl = String.format(
                "https://dummy-storage.example.com/resumes/user-%d-resume.pdf",
                interviewee.getId()
        );

        Resume newResume = Resume.of(interviewee, dummyPdfUrl);
        Resume savedResume = resumeRepository.save(newResume);

        log.info("더미 Resume 생성: resumeId={}, userId={}", savedResume.getId(), interviewee.getId());
        return savedResume;
    }

    private Interview createCompletedInterview(InterviewerProfile interviewer, Resume resume, User interviewee) {
        // 면접 제목 생성
        String title = String.format("%s님과의 면접 - %s",
                interviewer.getUser().getUsername(),
                interviewer.getPosition()
        );

        // 면접 생성
        Interview interview = Interview.of(interviewer, resume, title);

        // 날짜 설정: 최근 1개월 내 랜덤
        LocalDateTime now = LocalDateTime.now();
        int daysAgo = 1 + random.nextInt(30); // 1~30일 전
        int startHour = 9 + random.nextInt(9); // 9~17시
        int startMinute = random.nextInt(60);

        LocalDateTime startedAt = now
                .minusDays(daysAgo)
                .withHour(startHour)
                .withMinute(startMinute)
                .withSecond(0)
                .withNano(0);

        // 면접 종료: 30~90분 후
        int durationMinutes = 30 + random.nextInt(61); // 30~90분
        LocalDateTime endedAt = startedAt.plusMinutes(durationMinutes);

        // 면접 시작 (IN_PROGRESS로 변경)
        interview.start();

        // 과거 시간으로 조정
        interview.forceSetStartedAt(startedAt);

        // 면접 완료 (COMPLETED로 변경)
        interview.complete();

        // 과거 종료 시간으로 조정
        interview.forceSetEndedAt(endedAt);

        return interview;
    }

    private void createQuestionsForInterview(Interview interview, int count) {
        // 랜덤하게 질문/답변 선택
        List<Integer> selectedIndices = new ArrayList<>();
        while (selectedIndices.size() < count) {
            int index = random.nextInt(QUESTION_POOL.size());
            if (!selectedIndices.contains(index)) {
                selectedIndices.add(index);
            }
        }

        // 질문 생성
        for (int i = 0; i < count; i++) {
            int index = selectedIndices.get(i);
            String questionContent = QUESTION_POOL.get(index);
            String answerContent = ANSWER_POOL.get(Math.min(index, ANSWER_POOL.size() - 1));

            Question question = Question.of(interview, questionContent, i + 1);
            question.updateAnswer(answerContent);

            questionRepository.save(question);
        }
    }
}
