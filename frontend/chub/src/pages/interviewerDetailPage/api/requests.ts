import { api } from "@/shared/api/api";
import type {
    ApiResponse,
    InterviewerProfileResponse,
} from "@/entities/interviewer/model/types";

/**
 * 면접관 상세 정보 조회
 * GET /api/profiles/interviewers/:id
 */
export const getInterviewerDetail = async (
    id: number
): Promise<ApiResponse<InterviewerProfileResponse> | null> => {
    try {
        const response = await api.get<ApiResponse<InterviewerProfileResponse>>(
            `/api/profiles/interviewers/${id}`
        );
        return response.data;
    } catch (error) {
        console.warn("getInterviewerDetail API 호출 실패:", error);
        return null;
    }
};

export interface CreateInterviewRequestRequest {
    interviewerId: number;
    requestMessage: string;
}

export interface CreateInterviewRequestResponse {
    success: boolean;
    status: string;
    timestamp: string;
}

export const createInterviewRequest = async (
    data: CreateInterviewRequestRequest
): Promise<CreateInterviewRequestResponse | null> => {
    try {
        const response = await api.post<CreateInterviewRequestResponse>(
            "/api/interviews/requests",
            data
        );
        return response.data;
    } catch (error) {
        console.warn("createInterviewRequest API 호출 실패:", error);
        return null;
    }
};
