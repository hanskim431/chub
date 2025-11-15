import { api } from "@/shared/api/api";

export interface PracticeQuestion {
    id: number;
    question: string;
    category?: string;
}

export interface PracticeAnswer {
    questionId: number;
    answer: string;
}

export interface StartPracticeRequest {
    interviewerId?: number;
    field?: string;
}

export interface StartPracticeResponse {
    practiceId: number;
    questions: PracticeQuestion[];
}

export interface PracticeSession {
    id: number;
    interviewerId?: number;
    field?: string;
    questions: PracticeQuestion[];
    answers: PracticeAnswer[];
    startedAt: string;
    completedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    data?: T;
    errorCode?: string;
    errorMessage?: string;
    errorData?: unknown;
    timestamp?: string;
}

/**
 * 면접 연습 시작
 * POST /api/interviews/practice/start
 */
export const startPractice = async (
    data: StartPracticeRequest
): Promise<ApiResponse<StartPracticeResponse> | null> => {
    try {
        const response = await api.post<ApiResponse<StartPracticeResponse>>(
            "/api/interviews/practice/start",
            data
        );
        return response.data;
    } catch (error) {
        console.warn("startPractice API 호출 실패:", error);
        return null;
    }
};

/**
 * 면접 연습 세션 조회
 * GET /api/interviews/practice/:id
 */
export const getPracticeSession = async (
    id: number
): Promise<ApiResponse<PracticeSession> | null> => {
    try {
        const response = await api.get<ApiResponse<PracticeSession>>(
            `/api/interviews/practice/${id}`
        );
        return response.data;
    } catch (error) {
        console.warn("getPracticeSession API 호출 실패:", error);
        return null;
    }
};

/**
 * 답변 제출
 * POST /api/interviews/practice/:id/answer
 */
export const submitAnswer = async (
    practiceId: number,
    answer: PracticeAnswer
): Promise<ApiResponse<void> | null> => {
    try {
        const response = await api.post<ApiResponse<void>>(
            `/api/interviews/practice/${practiceId}/answer`,
            answer
        );
        return response.data;
    } catch (error) {
        console.warn("submitAnswer API 호출 실패:", error);
        return null;
    }
};

/**
 * 면접 연습 완료
 * POST /api/interviews/practice/:id/complete
 */
export const completePractice = async (
    practiceId: number
): Promise<ApiResponse<PracticeSession> | null> => {
    try {
        const response = await api.post<ApiResponse<PracticeSession>>(
            `/api/interviews/practice/${practiceId}/complete`
        );
        return response.data;
    } catch (error) {
        console.warn("completePractice API 호출 실패:", error);
        return null;
    }
};

