import { api } from "@/shared/api/api";

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface InterviewRecord {
  id: number;
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
  completedAt: string;
  questionsAndAnswers: QuestionAnswer[];
}

export interface InterviewRecordResponse {
  success: boolean;
  status: string;
  data: InterviewRecord;
  timestamp: string;
}

export const getInterviewRecord = async (
  id: number
): Promise<InterviewRecordResponse | null> => {
  try {
    const response = await api.get<InterviewRecordResponse>(
      `/api/interviews/records/${id}`
    );
    return response.data;
  } catch (error) {
    console.warn("getInterviewRecord API 호출 실패:", error);
    return null;
  }
};

