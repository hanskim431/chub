import { api } from "@/shared/api/api";

export interface TranscriptItem {
  id: number;
  speaker: "interviewer" | "interviewee";
  text: string;
  timestamp: string;
}

export interface InterviewRecord {
  id: number;
  sessionId: string;
  opponent: {
    id: number;
    name: string;
    avatar: string;
  };
  role: "interviewer" | "interviewee";
  date: string;
  duration: number; // 초 단위
  transcript: TranscriptItem[];
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
