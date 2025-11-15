import { http, HttpResponse } from "msw";

// 이력서 목업 데이터
const mockResumes = [
  {
    id: 1,
    name: "이력서_2025_01.pdf",
    pdfUrl: "http://localhost:8080/files/resumes/resume_1_20250127143000.pdf",
    createdAt: "2025-01-27T14:30:00Z",
    updatedAt: "2025-01-27T14:30:00Z",
  },
  {
    id: 2,
    name: "이력서_백엔드_개발자.pdf",
    pdfUrl: "http://localhost:8080/files/resumes/resume_2_20250128120000.pdf",
    createdAt: "2025-01-28T12:00:00Z",
    updatedAt: "2025-01-28T12:00:00Z",
  },
  {
    id: 3,
    name: "이력서_최종본.pdf",
    pdfUrl: "http://localhost:8080/files/resumes/resume_3_20250129150000.pdf",
    createdAt: "2025-01-29T15:00:00Z",
    updatedAt: "2025-01-29T15:00:00Z",
  },
];

export const resumeHandlers = [
  // V2 API: 내 이력서 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/v2/profiles/resumes`,
    async () => {
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          pdfUrl: "http://localhost:8080/files/resumes/resume_1_20250127143000.pdf",
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // V2 API: 내 이력서 목록 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/v2/profiles/resumes/list`,
    async () => {
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          resumes: mockResumes,
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // V2 API: 이력서 업로드/수정 (PUT)
  http.put(
    `${import.meta.env.VITE_API_URL}/api/v2/profiles/resumes`,
    async () => {
      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // V2 API: 내 이력서 삭제
  http.delete(
    `${import.meta.env.VITE_API_URL}/api/v2/profiles/resumes/me`,
    async () => {
      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // V2 API: 특정 사용자의 이력서 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/v2/profiles/users/:userId/resumes`,
    async () => {
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          pdfUrl: "http://localhost:8080/files/resumes/resume_1_20250127143000.pdf",
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),
];
