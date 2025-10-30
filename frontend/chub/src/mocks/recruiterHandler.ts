import { http, HttpResponse } from "msw";

interface Recruiter {
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

const mockRecruiters: Recruiter[] = [
  {
    id: "1",
    name: "강진구",
    email: "jinku.kang@example.com",
    avatar: "/logo.png",
    field: "백엔드 개발",
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
    field: "플랫폼 개발",
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
    field: "AI/ML",
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
    field: "DevOps 엔지니어링",
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
    id: "recruiter_5",
    name: "배수헌",
    email: "soohyun.bae@example.com",
    avatar: "/logo.png",
    field: "보안 엔지니어링",
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

export const recruiterHandlers = [
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/recruiters`,
    async ({ params }) => {
      const { page, size } = params as {
        page: string;
        size: string;
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          recruiters: mockRecruiters.map((recruiter) => ({
            id: recruiter.id,
            name: recruiter.name,
            avatar: recruiter.avatar,
            field: recruiter.field,
            company: recruiter.company,
            position: recruiter.position,
            bio: recruiter.bio,
            experiences: recruiter.experiences,
            specialties: recruiter.specialties,
            price: recruiter.price,
          })),
          pageInfo: {
            page: parseInt(page),
            size: parseInt(size),
            totalElements: mockRecruiters.length,
            totalPages: Math.ceil(mockRecruiters.length / parseInt(size)),
            first: page === "0",
            last:
              parseInt(page) ===
              Math.ceil(mockRecruiters.length / parseInt(size)) - 1,
          },
        },
      });
    }
  ),
  // 면접관 상세 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/recruiters/:id`,
    async ({ params }) => {
      const { id } = params as { id: string };
      const recruiter = mockRecruiters.find((recruiter) => recruiter.id === id);
      if (!recruiter) {
        return HttpResponse.error();
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: recruiter,
      });
    }
  ),
  // 내 면접관 프로필 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/me`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: mockRecruiters[0],
      });
    }
  ),
  // 내 면접관 프로필 수정
  http.post(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/me`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),
];
