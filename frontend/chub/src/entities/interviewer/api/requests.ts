import { api } from "@/shared/api/api";
import type {
  ApiResponse,
  InterviewerProfileResponse,
  CreateInterviewerProfileRequest,
  UpdateInterviewerProfileRequest,
} from "@/entities/interviewer/model/types";

/**
 * 내 면접관 프로필 조회
 * GET /api/profiles/interviewers/me
 */
export const getMyInterviewerProfile =
  async (): Promise<ApiResponse<InterviewerProfileResponse> | null> => {
    try {
      const response = await api.get<ApiResponse<InterviewerProfileResponse>>(
        "/api/profiles/interviewers/me"
      );
      return response.data;
    } catch (error: any) {
      // 404 에러인 경우 응답 데이터를 반환 (MSW에서 success: false로 반환)
      if (error.response?.status === 404) {
        return (
          error.response.data || {
            success: false,
            status: 404,
            errorMessage: "면접관 프로필을 찾을 수 없습니다.",
            timestamp: new Date().toISOString(),
          }
        );
      }
      console.warn("getMyInterviewerProfile API 호출 실패:", error);
      return null;
    }
  };

/**
 * 면접관 프로필 생성
 * POST /api/profiles/interviewers/me
 */
export const createInterviewerProfile = async (
  data: CreateInterviewerProfileRequest
): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(
    "/api/profiles/interviewers/me",
    data
  );
  return response.data;
};

/**
 * 면접관 프로필 수정 (부분 수정)
 * PATCH /api/profiles/interviewers/me
 * null이 아닌 필드만 업데이트
 */
export const updateInterviewerProfile = async (
  data: UpdateInterviewerProfileRequest
): Promise<ApiResponse<void>> => {
  const response = await api.patch<ApiResponse<void>>(
    "/api/profiles/interviewers/me",
    data
  );
  return response.data;
};
