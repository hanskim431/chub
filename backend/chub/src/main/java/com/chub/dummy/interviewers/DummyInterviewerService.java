package com.chub.dummy.interviewers;

import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.entity.vo.*;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DummyInterviewerService {

    private final UserRepository userRepository;
    private final InterviewerProfileRepository interviewerProfileRepository;

    @Transactional
    public void createDummyInterviewers() {
        log.info("더미 면접관 데이터 생성 시작...");

        List<InterviewerData> dummyData = createDummyData();
        int created = 0;
        int skipped = 0;

        for (InterviewerData data : dummyData) {
            // 중복 체크
            if (userRepository.findBySub(data.sub).isPresent()) {
                log.info("이미 존재하는 면접관: {}", data.sub);
                skipped++;
                continue;
            }

            // User 생성
            User user = User.of(data.sub, data.name);
            user.updateEmail(data.email);
            user.updateBio(data.bio);
            userRepository.save(user);

            // InterviewerProfile 생성
            InterviewerProfile profile = InterviewerProfile.of(user, data.company, data.position);
            profile.updateEmail(data.email);
            profile.updateField(data.field);
            profile.updatePrice(data.price);
            profile.updateIntroduction(data.introduction);
            profile.updateBasicInfo(data.company, data.position, data.department, data.careerLevel);
            profile.updateInterviewStyle(data.interviewStyle);

            // JSONB 필드 설정
            profile.updateLanguages(data.languages);
            profile.updateSpecialties(data.specialties);
            profile.updateExperience(null, data.experiences);
            profile.updateEducations(data.educations);
            profile.updateCertifications(data.certifications);
            profile.updateAvailableTimeSlots(data.availableTimeSlots);

            interviewerProfileRepository.save(profile);
            created++;
            log.info("면접관 생성 완료: {} ({})", data.name, data.sub);
        }

        log.info("더미 면접관 데이터 생성 완료 - 생성: {}명, 스킵: {}명", created, skipped);
    }

    @Transactional
    public void deleteDummyInterviewers() {
        log.info("더미 면접관 데이터 삭제 시작...");

        String[] fields = {"frontend", "backend", "mobile", "devops", "ai", "game", "design", "product", "marketing", "management"};
        List<User> dummyUsers = new ArrayList<>();

        for (String field : fields) {
            for (int i = 1; i <= 10; i++) {
                String sub = String.format("dev-interviewer-%s-%03d", field, i);
                userRepository.findBySub(sub).ifPresent(dummyUsers::add);
            }
        }

        for (User user : dummyUsers) {
            // InterviewerProfile 먼저 삭제
            interviewerProfileRepository.findByUserId(user.getId())
                    .ifPresent(interviewerProfileRepository::delete);
            // User 삭제
            userRepository.delete(user);
            log.info("면접관 삭제 완료: {} ({})", user.getUsername(), user.getSub());
        }

        log.info("더미 면접관 데이터 삭제 완료 - 삭제: {}명", dummyUsers.size());
    }

    private List<InterviewerData> createDummyData() {
        List<InterviewerData> data = new ArrayList<>();

        // Field별로 10명씩 생성
        data.addAll(createFrontendInterviewers());
        data.addAll(createBackendInterviewers());
        data.addAll(createMobileInterviewers());
        data.addAll(createDevOpsInterviewers());
        data.addAll(createAIInterviewers());
        data.addAll(createGameInterviewers());
        data.addAll(createDesignInterviewers());
        data.addAll(createProductInterviewers());
        data.addAll(createMarketingInterviewers());
        data.addAll(createManagementInterviewers());

        return data;
    }

    // Frontend 개발자 10명
    private List<InterviewerData> createFrontendInterviewers() {
        String[] names = {"박지수", "한소희", "이수민", "최유진", "강민서", "윤서연", "정다은", "김하은", "송지우", "임채원"};
        String[] companies = {"토스", "우아한형제들", "카카오", "네이버", "쿠팡", "당근마켓", "라인", "배달의민족", "야놀자", "직방"};
        String[] positions = {"프론트엔드 개발자", "시니어 프론트엔드 개발자", "리드 프론트엔드 개발자", "프론트엔드 엔지니어", "주니어 프론트엔드 개발자", "프론트엔드 개발자", "시니어 프론트엔드 개발자", "프론트엔드 개발자", "프론트엔드 엔지니어", "리드 프론트엔드 개발자"};
        int[] prices = {90000, 70000, 85000, 120000, 60000, 95000, 110000, 75000, 100000, 150000};

        return createInterviewers("frontend", names, companies, positions, prices,
                List.of("JavaScript", "TypeScript", "React"),
                List.of("프론트엔드", "React", "UI/UX"));
    }

    // Backend 개발자 10명
    private List<InterviewerData> createBackendInterviewers() {
        String[] names = {"김민준", "이서준", "최하은", "정우진", "송재현", "박준혁", "강동현", "윤태양", "임재훈", "조민재"};
        String[] companies = {"네이버", "당근마켓", "구글 코리아", "쿠팡", "마이크로소프트 코리아", "삼성전자", "SK텔레콤", "LG CNS", "현대오토에버", "NH디지털"};
        String[] positions = {"시니어 백엔드 개발자", "백엔드 개발자", "소프트웨어 엔지니어", "데이터 엔지니어", "리드 소프트웨어 엔지니어", "백엔드 개발자", "시니어 개발자", "백엔드 엔지니어", "수석 개발자", "백엔드 아키텍트"};
        int[] prices = {120000, 100000, 150000, 110000, 200000, 115000, 130000, 95000, 180000, 160000};

        return createInterviewers("backend", names, companies, positions, prices,
                List.of("Java", "Spring Boot", "Python"),
                List.of("백엔드", "MSA", "대용량 트래픽"));
    }

    // Mobile 개발자 10명
    private List<InterviewerData> createMobileInterviewers() {
        String[] names = {"임지우", "김서현", "박준영", "이채은", "정지훈", "강예은", "윤하준", "최서아", "송민호", "한유진"};
        String[] companies = {"카카오", "쿠팡", "토스", "배달의민족", "네이버", "라인", "당근마켓", "야놀자", "직방", "마켓컬리"};
        String[] positions = {"안드로이드 개발자", "iOS 개발자", "모바일 개발자", "시니어 안드로이드 개발자", "시니어 iOS 개발자", "모바일 엔지니어", "리드 안드로이드 개발자", "iOS 개발자", "모바일 개발자", "시니어 모바일 개발자"};
        int[] prices = {95000, 100000, 90000, 125000, 130000, 105000, 140000, 95000, 85000, 120000};

        return createInterviewers("mobile", names, companies, positions, prices,
                List.of("Kotlin", "Swift", "Java"),
                List.of("모바일", "안드로이드", "iOS"));
    }

    // DevOps 엔지니어 10명
    private List<InterviewerData> createDevOpsInterviewers() {
        String[] names = {"강서연", "박도윤", "이준호", "김태현", "정민수", "윤지호", "최현우", "송유나", "임수빈", "한지안"};
        String[] companies = {"삼성전자", "NHN", "카카오", "네이버", "쿠팡", "토스", "라인", "우아한형제들", "당근마켓", "SK C&C"};
        String[] positions = {"DevOps 엔지니어", "시스템 엔지니어", "시니어 DevOps 엔지니어", "SRE", "클라우드 엔지니어", "DevOps 엔지니어", "인프라 엔지니어", "시니어 SRE", "DevOps 리드", "클라우드 아키텍트"};
        int[] prices = {130000, 95000, 145000, 150000, 125000, 110000, 105000, 160000, 170000, 180000};

        return createInterviewers("devops", names, companies, positions, prices,
                List.of("Python", "Bash", "Go"),
                List.of("DevOps", "Kubernetes", "CI/CD"));
    }

    // AI/ML 엔지니어 10명
    private List<InterviewerData> createAIInterviewers() {
        String[] names = {"윤도현", "이서진", "박하윤", "김지율", "정예린", "최시우", "강다현", "송준서", "임나윤", "한서준"};
        String[] companies = {"네이버 클로바", "SK텔레콤", "카카오브레인", "구글 코리아", "삼성리서치", "LG AI연구원", "네이버", "현대자동차", "KT", "NAVER LABS"};
        String[] positions = {"ML 엔지니어", "AI 연구원", "시니어 ML 엔지니어", "AI 엔지니어", "연구원", "시니어 AI 연구원", "ML 엔지니어", "AI 개발자", "리서치 엔지니어", "수석 연구원"};
        int[] prices = {140000, 130000, 160000, 170000, 150000, 155000, 145000, 135000, 165000, 190000};

        return createInterviewers("ai", names, companies, positions, prices,
                List.of("Python", "TensorFlow", "PyTorch"),
                List.of("AI/ML", "딥러닝", "자연어처리"));
    }

    // Game 개발자 10명
    private List<InterviewerData> createGameInterviewers() {
        String[] names = {"이현준", "김도영", "박서우", "정하린", "최윤서", "강시후", "윤민재", "송아린", "임지안", "한준우"};
        String[] companies = {"넥슨", "엔씨소프트", "넷마블", "크래프톤", "펄어비스", "스마일게이트", "컴투스", "위메이드", "게임빌", "카카오게임즈"};
        String[] positions = {"게임 클라이언트 개발자", "게임 서버 개발자", "시니어 게임 개발자", "유니티 개발자", "언리얼 개발자", "게임 엔진 개발자", "시니어 서버 개발자", "게임 프로그래머", "리드 개발자", "테크니컬 디렉터"};
        int[] prices = {110000, 105000, 135000, 100000, 120000, 115000, 130000, 95000, 160000, 180000};

        return createInterviewers("game", names, companies, positions, prices,
                List.of("C++", "C#", "Unity"),
                List.of("게임 개발", "Unity", "Unreal"));
    }

    // Designer 10명
    private List<InterviewerData> createDesignInterviewers() {
        String[] names = {"박수아", "김예진", "이지원", "정시은", "최하율", "강서윤", "윤주아", "송다인", "임유진", "한서하"};
        String[] companies = {"카카오", "네이버", "토스", "쿠팡", "배달의민족", "당근마켓", "야놀자", "직방", "라인", "우아한형제들"};
        String[] positions = {"UX 디자이너", "UI 디자이너", "시니어 프로덕트 디자이너", "리드 디자이너", "프로덕트 디자이너", "UX/UI 디자이너", "시니어 UX 디자이너", "디자이너", "시각 디자이너", "디자인 리드"};
        int[] prices = {90000, 85000, 130000, 150000, 100000, 95000, 125000, 80000, 105000, 160000};

        return createInterviewers("design", names, companies, positions, prices,
                List.of("Figma", "Sketch", "Adobe XD"),
                List.of("UI/UX", "프로덕트 디자인", "사용자 경험"));
    }

    // Product Manager 10명
    private List<InterviewerData> createProductInterviewers() {
        String[] names = {"정태민", "김소연", "이동훈", "박채린", "최재윤", "강민기", "윤지민", "송하준", "임수아", "한도윤"};
        String[] companies = {"토스", "카카오", "네이버", "쿠팡", "배달의민족", "당근마켓", "야놀자", "직방", "라인", "우아한형제들"};
        String[] positions = {"프로덕트 매니저", "시니어 PM", "프로덕트 오너", "리드 PM", "PM", "시니어 프로덕트 매니저", "프로덕트 리드", "PM", "수석 PM", "Head of Product"};
        int[] prices = {120000, 140000, 150000, 170000, 110000, 145000, 165000, 115000, 180000, 200000};

        return createInterviewers("product", names, companies, positions, prices,
                List.of("Product Strategy", "Data Analysis", "Agile"),
                List.of("프로덕트 관리", "전략", "데이터 분석"));
    }

    // Marketer 10명
    private List<InterviewerData> createMarketingInterviewers() {
        String[] names = {"김지애", "이현지", "박민지", "정수빈", "최유나", "강예원", "윤하윤", "송지안", "임서진", "한채원"};
        String[] companies = {"카카오", "네이버", "쿠팡", "배달의민족", "토스", "당근마켓", "야놀자", "직방", "마켓컬리", "무신사"};
        String[] positions = {"그로스 마케터", "퍼포먼스 마케터", "시니어 마케터", "마케팅 매니저", "디지털 마케터", "브랜드 마케터", "시니어 그로스 마케터", "마케팅 리드", "CRM 마케터", "마케팅 디렉터"};
        int[] prices = {100000, 95000, 125000, 130000, 105000, 115000, 140000, 150000, 110000, 170000};

        return createInterviewers("marketing", names, companies, positions, prices,
                List.of("Google Analytics", "SQL", "Python"),
                List.of("그로스 해킹", "퍼포먼스 마케팅", "데이터 분석"));
    }

    // Management 10명
    private List<InterviewerData> createManagementInterviewers() {
        String[] names = {"박성훈", "김민철", "이준영", "정현우", "최재혁", "강태웅", "윤상현", "송지훈", "임건우", "한석진"};
        String[] companies = {"네이버", "카카오", "삼성전자", "LG전자", "SK하이닉스", "현대자동차", "포스코", "한화", "롯데", "CJ"};
        String[] positions = {"Engineering Manager", "개발팀장", "CTO", "VP of Engineering", "Tech Lead", "개발실장", "Head of Engineering", "Engineering Director", "CPO", "부사장"};
        int[] prices = {180000, 190000, 250000, 220000, 200000, 210000, 230000, 195000, 240000, 260000};

        return createInterviewers("management", names, companies, positions, prices,
                List.of("Leadership", "Strategy", "Management"),
                List.of("리더십", "전략", "조직 관리"));
    }

    // 헬퍼 메서드: field별 면접관 리스트 생성
    private List<InterviewerData> createInterviewers(String field, String[] names, String[] companies,
                                                      String[] positions, int[] prices,
                                                      List<String> languages, List<String> specialties) {
        List<InterviewerData> interviewers = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            interviewers.add(InterviewerData.builder()
                    .sub(String.format("dev-interviewer-%s-%03d", field, i + 1))
                    .name(names[i])
                    .email(String.format("%s@%s.com", names[i].toLowerCase(), companies[i].toLowerCase().replace(" ", "")))
                    .bio(String.format("%s 분야 전문가", field))
                    .company(companies[i])
                    .position(positions[i])
                    .field(field)
                    .department(field + "팀")
                    .careerLevel(i < 3 ? "주니어" : i < 7 ? "미드레벨" : "시니어")
                    .price(prices[i])
                    .introduction(String.format("%s에서 %s로 근무하고 있습니다.", companies[i], positions[i]))
                    .interviewStyle("실무 중심의 기술 면접을 진행합니다.")
                    .languages(languages.stream().map(LanguageVo::new).collect(java.util.stream.Collectors.toList()))
                    .specialties(specialties.stream().map(SpecialtyVo::new).collect(java.util.stream.Collectors.toList()))
                    .experiences(List.of(
                            ExperienceVo.builder()
                                    .companyName(companies[i])
                                    .startYear(2020)
                                    .endYear(null)
                                    .position(positions[i])
                                    .description(String.format("%s 업무", field))
                                    .build()
                    ))
                    .educations(List.of(
                            EducationVo.builder()
                                    .schoolName("서울대학교")
                                    .major("컴퓨터공학")
                                    .degree("학사")
                                    .status("졸업")
                                    .graduationYear(2018)
                                    .build()
                    ))
                    .certifications(List.of())
                    .availableTimeSlots(List.of(
                            new AvailableTimeSlotVo("평일 19:00-21:00"),
                            new AvailableTimeSlotVo("토요일 14:00-18:00")
                    ))
                    .build());
        }

        return interviewers;
    }

    @lombok.Builder
    @lombok.Getter
    private static class InterviewerData {
        private String sub;
        private String name;
        private String email;
        private String bio;
        private String company;
        private String position;
        private String field;
        private String department;
        private String careerLevel;
        private Integer price;
        private String introduction;
        private String interviewStyle;
        private List<LanguageVo> languages;
        private List<SpecialtyVo> specialties;
        private List<ExperienceVo> experiences;
        private List<EducationVo> educations;
        private List<CertificationVo> certifications;
        private List<AvailableTimeSlotVo> availableTimeSlots;
    }
}
