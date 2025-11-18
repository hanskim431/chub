import { http, HttpResponse } from "msw";
import { mockRecruiters, mockManyRecruiters } from "@mocks/model/constants";
import type { Recruiter } from "@mocks/model/constants";
import type {
  InterviewerProfileResponse,
  UpdateInterviewerProfileRequest,
  CreateInterviewerProfileRequest,
} from "@/entities/interviewer/model/types";

// 내 면접관 프로필 상태 저장 (MSW 핸들러 간 상태 공유)
let myInterviewerProfile: InterviewerProfileResponse | null = null;

export const recruiterHandlers = [
  // 내 면접관 프로필 조회 (더 구체적인 경로를 먼저 등록)
  http.get(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/me`,
    async () => {
      if (!myInterviewerProfile) {
        return HttpResponse.json(
          {
            success: false,
            status: 404,
            errorMessage: "면접관 프로필을 찾을 수 없습니다.",
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        status: 200,
        data: myInterviewerProfile,
        timestamp: new Date().toISOString(),
      });
    }
  ),
  // 면접관 목록 조회
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
      const pageNum = parseInt(page); // 0-based
      const sizeNum = parseInt(size);
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          profiles: data
            .slice(pageNum * sizeNum, (pageNum + 1) * sizeNum)
            .map((recruiter: Recruiter) => ({
              id: recruiter.id,
              userId: Number(recruiter.id),
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
          page: pageNum, // 0-based
          size: sizeNum,
          totalElements: data.length,
          totalPages: Math.ceil(data.length / sizeNum),
          first: pageNum === 0,
          last: pageNum === Math.ceil(data.length / sizeNum) - 1,
        },
      });
    }
  ),
  // 면접관 상세 조회 (동적 파라미터는 나중에 등록)
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
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/:id`,
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
  // 내 면접관 프로필 생성
  http.post(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/me`,
    async ({ request }) => {
      const body = (await request.json()) as CreateInterviewerProfileRequest;

      // 기본 프로필 데이터 생성
      const baseProfile = mockRecruiters[0];
      myInterviewerProfile = {
        id: parseInt(baseProfile.id),
        userId: parseInt(baseProfile.id),
        name: body.name || baseProfile.name,
        email: body.email || baseProfile.email,
        avatar: body.avatar ?? baseProfile.avatar,
        field: body.field || baseProfile.field,
        company: body.company ?? baseProfile.company,
        position: body.position ?? baseProfile.position,
        bio: body.bio ?? baseProfile.bio,
        experiences:
          body.experiences ||
          baseProfile.experiences.map((experience) => ({
            company: experience.company,
            startedYear: experience.startedYear,
            endedYear:
              experience.endedYear !== undefined
                ? String(experience.endedYear)
                : null,
            role: experience.role,
          })),
        specialties: body.specialties || baseProfile.specialties,
        education:
          body.education ||
          baseProfile.education.map((education) => ({
            school: education.school,
            startedYear: education.startedYear,
            endedYear: education.endedYear ?? null,
            role: education.role,
          })),
        certifications:
          body.certifications ||
          baseProfile.certifications.map((certification) => ({
            name: certification.name,
            year: certification.year,
          })),
        languages: body.languages || baseProfile.languages,
        interviewStyle: body.interviewStyle ?? baseProfile.interviewStyle,
        availableTimeSlots:
          body.availableTimeSlots || baseProfile.availableTimeSlots,
        price: body.price ?? baseProfile.price,
        isActive: true, // 기본값
      };

      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),
  // 내 면접관 프로필 수정
  http.patch(
    `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/me`,
    async ({ request }) => {
      if (!myInterviewerProfile) {
        return HttpResponse.json(
          {
            success: false,
            status: 404,
            errorMessage: "면접관 프로필을 찾을 수 없습니다.",
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      const body = (await request.json()) as UpdateInterviewerProfileRequest;

      // 프로필 데이터 업데이트
      myInterviewerProfile = {
        ...myInterviewerProfile,
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.field !== undefined && { field: body.field }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.experiences !== undefined && {
          experiences: body.experiences,
        }),
        ...(body.specialties !== undefined && {
          specialties: body.specialties,
        }),
        ...(body.education !== undefined && { education: body.education }),
        ...(body.certifications !== undefined && {
          certifications: body.certifications,
        }),
        ...(body.languages !== undefined && { languages: body.languages }),
        ...(body.interviewStyle !== undefined && {
          interviewStyle: body.interviewStyle,
        }),
        ...(body.availableTimeSlots !== undefined && {
          availableTimeSlots: body.availableTimeSlots,
        }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      };

      return HttpResponse.json({
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
      });
    }
  ),
];
