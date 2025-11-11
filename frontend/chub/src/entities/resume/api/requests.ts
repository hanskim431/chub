import { api } from "@/shared/api/api";
import type { ApiResponse, ResumeResponse } from "../model/types";

/**
 * 내 이력서 조회
 * GET /api/v2/profiles/resumes
 */
export const getMyResume = async (): Promise<ApiResponse<ResumeResponse> | null> => {
  try {
    const response = await api.get<ApiResponse<ResumeResponse>>("/api/v2/profiles/resumes");
    return response.data;
  } catch (error) {
    console.warn("getMyResume API 호출 실패:", error);
    return null;
  }
};

/**
 * 이력서 업로드 또는 수정
 * PUT /api/v2/profiles/resumes
 * @param file PDF 파일 (최대 10MB)
 */
export const uploadOrUpdateResume = async (file: File): Promise<ApiResponse<void>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.put<ApiResponse<void>>(
    "/api/v2/profiles/resumes",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * 내 이력서 삭제
 * DELETE /api/v2/profiles/resumes/me
 */
export const deleteMyResume = async (): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>("/api/v2/profiles/resumes/me");
  return response.data;
};
