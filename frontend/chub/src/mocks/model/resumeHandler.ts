import { http, HttpResponse } from "msw";

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
];
