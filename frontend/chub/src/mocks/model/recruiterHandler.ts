import { http, HttpResponse } from "msw";
import { mockRecruiters } from "@mocks/model/constants";
import type { Recruiter } from "@mocks/model/constants";
export const recruiterHandlers = [
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/recruiters`,
    async ({ params }) => {
      const { page, size } = params as {
        page: string;
        size: string;
      };

      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          recruiters: mockRecruiters.map((recruiter: Recruiter) => ({
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
      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),
];
