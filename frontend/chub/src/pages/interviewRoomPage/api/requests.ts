import { api } from "@/shared/api/api";

export interface InterviewQuestion {
    id: number;
    question: string;
    category?: string;
}

export interface InterviewAnswer {
    questionId: number;
    answer: string;
}

export interface InterviewSession {
    id: number;
    roomID: number;
    requestId: number;
    interviewer: {
        id: number;
        name: string;
        avatar: string;
        field: string;
    };
    interviewee: {
        id: number;
        name: string;
        avatar: string;
    };
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    startedAt?: string;
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
 * 면접 세션 조회
 * GET /api/interviews/rooms/:roomID
 */
export const getInterviewSession = async (
    roomID: number
): Promise<ApiResponse<InterviewSession> | null> => {
    try {
        const response = await api.get<ApiResponse<InterviewSession>>(
            `/api/interviews/rooms/${roomID}`
        );
        return response.data;
    } catch (error) {
        console.warn("getInterviewSession API 호출 실패:", error);
        return null;
    }
};

/**
 * 면접 시작
 * POST /api/interviews/rooms/:roomID/start
 */
export const startInterview = async (
    roomID: number
): Promise<ApiResponse<InterviewSession> | null> => {
    try {
        const response = await api.post<ApiResponse<InterviewSession>>(
            `/api/interviews/rooms/${roomID}/start`
        );
        return response.data;
    } catch (error) {
        console.warn("startInterview API 호출 실패:", error);
        return null;
    }
};

/**
 * 답변 제출
 * POST /api/interviews/rooms/:roomID/answer
 */
export const submitInterviewAnswer = async (
    roomID: number,
    answer: InterviewAnswer
): Promise<ApiResponse<void> | null> => {
    try {
        const response = await api.post<ApiResponse<void>>(
            `/api/interviews/rooms/${roomID}/answer`,
            answer
        );
        return response.data;
    } catch (error) {
        console.warn("submitInterviewAnswer API 호출 실패:", error);
        return null;
    }
};

/**
 * 면접 완료
 * POST /api/interviews/rooms/:roomID/complete
 */
export const completeInterview = async (
    roomID: number
): Promise<ApiResponse<InterviewSession> | null> => {
    try {
        const response = await api.post<ApiResponse<InterviewSession>>(
            `/api/interviews/rooms/${roomID}/complete`
        );
        return response.data;
    } catch (error) {
        console.warn("completeInterview API 호출 실패:", error);
        return null;
    }
};

