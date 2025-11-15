import { http, HttpResponse } from "msw";
import { mockRecruiters, mockManyRecruiters } from "@mocks/model/constants";
import type { Recruiter } from "@mocks/model/constants";
export const recruiterHandlers = [
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers`,
    async ({ request }) => {
      const url = new URL(request.url);
      const page = url.searchParams.get("page");
      const size = url.searchParams.get("size");
      const field = url.searchParams.get("field");
      const data = mockManyRecruiters.filter((recruiter: Recruiter) =>
        field ? recruiter.field.includes(field) : true
      );

      if (!page || !size) {
        return HttpResponse.error();
      }
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          profiles: data
            .slice(
              (parseInt(page) - 1) * parseInt(size),
              parseInt(page) * parseInt(size)
            )
            .map((recruiter: Recruiter) => ({
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
        },
        pageInfo: {
          page: parseInt(page),
          size: parseInt(size),
          totalElements: data.length,
          totalPages: Math.ceil(data.length / parseInt(size)),
          first: page === "0",
          last:
            parseInt(page) ===
            Math.ceil(
              Math.ceil(data.length / parseInt(size)) / parseInt(size)
            ) -
              1,
        },
      });
    }
  ),
  // 면접관 상세 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/:id`,
    async ({ params }) => {
      const id = params.id as string;
      const data = mockManyRecruiters;
      const recruiter = data.find((recruiter) => recruiter.id === id);
      if (!recruiter) {
        return HttpResponse.json(
          {
            success: false,
            status: 404,
            errorMessage: "면접관을 찾을 수 없습니다.",
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        status: 200,
        data: recruiter,
        timestamp: new Date().toISOString(),
      });
    }
  ),
  // 면접관 상세 조회 (레거시 엔드포인트)
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/recruiters/:id`,
    async ({ request }) => {
      const url = new URL(request.url);
      const id = url.pathname.split("/").pop();
      const data = mockManyRecruiters;
      const recruiter = data.find((recruiter) => recruiter.id === id);
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
