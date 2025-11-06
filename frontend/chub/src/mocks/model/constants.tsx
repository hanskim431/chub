export interface Recruiter {
  id: string;
  name: string;
  email: string;
  avatar: string;
  field: string;
  company: string;
  position: string;
  bio: string;
  experiences: {
    company: string;
    startedYear: number;
    endedYear?: number;
    role: string;
  }[];
  specialties: string[];
  education: {
    school: string;
    startedYear: number;
    endedYear?: number;
    role: string;
  }[];
  certifications: {
    name: string;
    year: number;
  }[];
  languages: string[];
  interviewStyle: string;
  availableTimeSlots: string[];
  price: number;
}

export interface RecruiterOverview {
  id: string;
  name: string;
  avatar: string;
  field: string;
  company: string;
  position: string;
  bio: string;
  experiences: {
    company: string;
    startedYear: number;
    endedYear?: number;
    role: string;
  }[];
  specialties: string[];
  price: number;
}

export const mockRecruiters: Recruiter[] = [
  {
    id: "1",
    name: "강진구",
    email: "jinku.kang@example.com",
    avatar: "/logo.png",
    field: "backend",
    company: "기업은행",
    position: "시니어 개발자",
    bio: "10년 경력의 백엔드 개발자로서 대규모 시스템 구축 및 운영 경험이 있습니다.",
    experiences: [
      {
        company: "기업은행",
        startedYear: 2020,
        role: "시니어 백엔드 개발자",
      },
      {
        company: "카카오",
        startedYear: 2017,
        endedYear: 2019,
        role: "백엔드 개발자",
      },
      {
        company: "스타트업",
        startedYear: 2015,
        endedYear: 2017,
        role: "풀스택 개발자",
      },
    ],
    specialties: ["Java", "Spring Boot", "Kubernetes", "MySQL", "Redis"],
    education: [
      {
        school: "서울대학교 컴퓨터공학과",
        startedYear: 2010,
        endedYear: 2014,
        role: "학사",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        year: 2022,
      },
    ],
    languages: ["c++", "python", "java", "spring", "spring boot"],
    interviewStyle:
      "실무 중심의 문제 해결 능력을 평가하며, 깊이있는 기술 토론을 선호합니다.",
    availableTimeSlots: ["평일 오후 7시-10시", "주말 오전 10시-오후 6시"],
    price: 80000,
  },
  {
    id: "2",
    name: "이뜨",
    email: "ddw.lee@example.com",
    avatar: "/logo.png",
    field: "frontend",
    company: "마이다스",
    position: "프론트엔드 시니어 개발자",
    bio: "8년 경력의 프론트엔드 개발자로 React, TypeScript 전문가입니다.",
    experiences: [
      {
        company: "마이다스",
        startedYear: 2020,
        role: "프론트엔드 시니어 개발자",
      },
      {
        company: "당근마켓",
        startedYear: 2018,
        endedYear: 2020,
        role: "프론트엔드 개발자",
      },
      {
        company: "네이버",
        startedYear: 2016,
        endedYear: 2018,
        role: "주니어 프론트엔드 개발자",
      },
    ],
    specialties: ["React", "TypeScript", "Next.js", "웹 성능 최적화"],
    education: [
      {
        school: "한양대학교 컴퓨터공학과",
        startedYear: 2012,
        endedYear: 2016,
        role: "학사",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        year: 2023,
      },
    ],
    languages: ["react", "typescript", "next.js", "javascript", "html", "css"],
    interviewStyle: "코딩 실기와 함께 코드 리뷰 스타일의 면접을 진행합니다.",
    availableTimeSlots: ["평일 오전 10시-오후 6시", "주말 오전 9시-오후 5시"],
    price: 75000,
  },
  {
    id: "3",
    name: "유은지",
    email: "eunji.yu@example.com",
    avatar: "/logo.png",
    field: "ai",
    company: "네이버",
    position: "AI 엔지니어",
    bio: "MLOps 및 AI 플랫폼 구축에 특화된 개발자입니다.",
    experiences: [
      {
        company: "네이버",
        startedYear: 2022,
        role: "AI 엔지니어",
      },
      {
        company: "라인",
        startedYear: 2019,
        endedYear: 2022,
        role: "ML 엔지니어",
      },
      {
        company: "KT",
        startedYear: 2017,
        endedYear: 2019,
        role: "데이터 분석가",
      },
    ],
    specialties: ["MLOps", "추천 시스템", "Python", "TensorFlow", "Pytorch"],
    education: [
      {
        school: "KAIST 소프트웨어공학",
        startedYear: 2014,
        endedYear: 2017,
        role: "석사",
      },
      {
        school: "서울대학교 통계학과",
        startedYear: 2010,
        endedYear: 2014,
        role: "학사",
      },
    ],
    certifications: [
      {
        name: "TensorFlow Developer Certificate",
        year: 2021,
      },
    ],
    languages: [
      "python",
      "tensorflow",
      "pytorch",
      "pandas",
      "numpy",
      "scikit-learn",
    ],
    interviewStyle:
      "논문과 실제 프로젝트 경험을 중심으로 깊이있는 질문을 합니다.",
    availableTimeSlots: ["평일 오후 6시-9시", "주말 오후 2시-8시"],
    price: 90000,
  },
  {
    id: "4",
    name: "김한수",
    email: "hansu.kim@example.com",
    avatar: "/logo.png",
    field: "devops",
    company: "삼성전자",
    position: "DevOps 엔지니어",
    bio: "클라우드 인프라 및 CI/CD 파이프라인 설계 전문가입니다.",
    experiences: [
      {
        company: "삼성전자",
        startedYear: 2021,
        role: "DevOps 엔지니어",
      },
      {
        company: "우아한형제들",
        startedYear: 2018,
        endedYear: 2021,
        role: "인프라 엔지니어",
      },
      {
        company: "스타트업",
        startedYear: 2016,
        endedYear: 2018,
        role: "시스템 엔지니어",
      },
    ],
    specialties: ["AWS", "Kubernetes", "CI/CD", "Docker", "Terraform"],
    education: [
      {
        school: "한국과학기술원 전산학과",
        startedYear: 2012,
        endedYear: 2016,
        role: "학사",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        year: 2020,
      },
      {
        name: "CKA (Certified Kubernetes Administrator)",
        year: 2021,
      },
    ],
    languages: ["한국어", "영어"],
    interviewStyle: "인프라 설계 능력과 트러블슈팅 경험을 중심으로 평가합니다.",
    availableTimeSlots: ["평일 오후 8시-10시", "주말 오전 10시-오후 4시"],
    price: 85000,
  },
  {
    id: "5",
    name: "배수헌",
    email: "soohyun.bae@example.com",
    avatar: "/logo.png",
    field: "backend",
    company: "넥슨코리아",
    position: "보안 엔지니어",
    bio: "애플리케이션 보안 및 보안 아키텍처 전문가입니다.",
    experiences: [
      {
        company: "넥슨코리아",
        startedYear: 2020,
        role: "보안 엔지니어",
      },
      {
        company: "쿠팡",
        startedYear: 2017,
        endedYear: 2020,
        role: "정보보안 엔지니어",
      },
      {
        company: "LG CNS",
        startedYear: 2015,
        endedYear: 2017,
        role: "보안 컨설턴트",
      },
    ],
    specialties: ["애플리케이션 보안", "침투 테스트", "OWASP Top 10"],
    education: [
      {
        school: "고려대학교 정보보호학과",
        startedYear: 2011,
        endedYear: 2015,
        role: "학사",
      },
      {
        school: "서울대학교 컴퓨터공학",
        startedYear: 2015,
        endedYear: 2017,
        role: "석사",
      },
    ],
    certifications: [
      {
        name: "CISSP",
        year: 2018,
      },
      {
        name: "CEH (Certified Ethical Hacker)",
        year: 2019,
      },
    ],
    languages: ["한국어", "영어"],
    interviewStyle:
      "보안 취약점 분석과 대응 방안에 대한 실무 역량을 평가합니다.",
    availableTimeSlots: ["평일 오후 7시-9시", "주말 오후 1시-6시"],
    price: 95000,
  },
];

export const mockManyRecruiters: Recruiter[] = [
  {
    ...mockRecruiters[0],
    id: "1",
    name: "이상혁",
    email: "sanghyuk.lee@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "2",
    name: "정지훈",
    email: "jihun.jeong@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "3",
    name: "김혁규",
    email: "hyukkyu.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "4",
    name: "박재혁",
    email: "jaehyuk.park@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "5",
    name: "류민석",
    email: "minseok.ryu@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "6",
    name: "이민형",
    email: "minhyung.lee@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "7",
    name: "최우제",
    email: "woojae.choi@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "8",
    name: "김건부",
    email: "geonbu.kim@example.com",
  },
  { ...mockRecruiters[3], id: "9", name: "허수", email: "su.heo@example.com" },
  {
    ...mockRecruiters[4],
    id: "10",
    name: "곽보성",
    email: "boseong.gwak@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "11",
    name: "한왕호",
    email: "wangho.han@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "12",
    name: "박도현",
    email: "dohyun.park@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "13",
    name: "손시우",
    email: "siu.son@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "14",
    name: "최현준",
    email: "hyunjun.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "15",
    name: "홍창현",
    email: "changhyun.hong@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "16",
    name: "문현준",
    email: "hyunjun.moon@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "17",
    name: "정윤성",
    email: "yunsung.jeong@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "18",
    name: "서진혁",
    email: "jinhyeok.seo@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "19",
    name: "이재우",
    email: "jaewoo.lee@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "20",
    name: "김종인",
    email: "jongin.kim@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "21",
    name: "문준용",
    email: "joonyong.moon@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "22",
    name: "김하람",
    email: "haram.kim@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "23",
    name: "김동범",
    email: "dongbeom.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "24",
    name: "김수환",
    email: "suhwan.kim@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "25",
    name: "김동하",
    email: "dongha.kim@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "26",
    name: "류수찬",
    email: "suchan.ryu@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "27",
    name: "이채환",
    email: "chaehwan.lee@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "28",
    name: "최우석",
    email: "wooseok.choi@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "29",
    name: "박재석",
    email: "jaeseok.park@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "30",
    name: "이하늘",
    email: "haneul.lee@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "31",
    name: "김건우",
    email: "geonwoo.kim@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "32",
    name: "정수빈",
    email: "subin.jeong@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "33",
    name: "황성훈",
    email: "sunghoon.hwang@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "34",
    name: "서대길",
    email: "daegil.seo@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "35",
    name: "박진성",
    email: "jinseong.park@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "36",
    name: "이재민",
    email: "jaemin.lee@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "37",
    name: "김태윤",
    email: "taeyoon.kim@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "38",
    name: "윤성빈",
    email: "sungbin.yoon@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "39",
    name: "최민준",
    email: "minjun.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "40",
    name: "박준형",
    email: "junhyung.park@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "41",
    name: "이성훈",
    email: "sunghoon.lee@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "42",
    name: "김민수",
    email: "minsu.kim@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "43",
    name: "정현우",
    email: "hyunwoo.jeong@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "44",
    name: "이동훈",
    email: "donghoon.lee@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "45",
    name: "김준호",
    email: "junho.kim@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "46",
    name: "박상준",
    email: "sangjun.park@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "47",
    name: "최성민",
    email: "sungmin.choi@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "48",
    name: "이건우",
    email: "geonwoo.lee@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "49",
    name: "김현우",
    email: "hyunwoo.kim@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "50",
    name: "정민석",
    email: "minseok.jeong@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "51",
    name: "박태현",
    email: "taehyun.park@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "52",
    name: "이준서",
    email: "junseo.lee@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "53",
    name: "김도현",
    email: "dohyun.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "54",
    name: "최윤호",
    email: "yunho.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "55",
    name: "정우진",
    email: "woojin.jeong@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "56",
    name: "박민재",
    email: "minjae.park@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "57",
    name: "이승우",
    email: "seungwoo.lee@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "58",
    name: "김준영",
    email: "joonyoung.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "59",
    name: "최재영",
    email: "jaeyoung.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "60",
    name: "정상우",
    email: "sangwoo.jeong@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "61",
    name: "박서준",
    email: "seojun.park@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "62",
    name: "이하준",
    email: "hajun.lee@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "63",
    name: "김시우",
    email: "siu.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "64",
    name: "최민혁",
    email: "minhyuk.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "65",
    name: "정준혁",
    email: "junhyuk.jeong@example.com",
  },
  {
    ...mockRecruiters[0],
    id: "66",
    name: "박지훈",
    email: "jihun.park@example.com",
  },
  {
    ...mockRecruiters[1],
    id: "67",
    name: "이태민",
    email: "taemin.lee@example.com",
  },
  {
    ...mockRecruiters[2],
    id: "68",
    name: "김우진",
    email: "woojin.kim@example.com",
  },
  {
    ...mockRecruiters[3],
    id: "69",
    name: "최준호",
    email: "junho.choi@example.com",
  },
  {
    ...mockRecruiters[4],
    id: "70",
    name: "정민규",
    email: "mingyu.jeong@example.com",
  },
];

export interface RecruiterOverviewResponse {
  recruiters: RecruiterOverview[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}
