import { api, del } from "@/shared/api/api";
import axios from "axios";

// 면접방 입장 응답 타입
export interface InterviewRoomResponse {
  id: number; // 면접방 ID
  status: string;
  opponent: {
    id: number;
    name: string;
    avatar: string;
  };
  chatHistory: Array<{
    type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
    senderId: number;
    senderNickname: string;
    receiverId: number;
    receiverNickname: string;
    message: string;
    createdAt: string;
  }>;
  currentQuestion: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
  errorData?: unknown;
  timestamp: string;
}

// 면접방 입장
export const joinInterviewRoom = async (
  interviewRequestId: string
): Promise<ApiResponse<InterviewRoomResponse>> => {
  // roomId에서 "room_" 접두사 제거 (예: "room_1" -> "1")
  const roomId = interviewRequestId.replace(/^room_/, "");
  const response = await api.post<ApiResponse<InterviewRoomResponse>>(
    `/api/interviews/rooms/${roomId}`
  );
  return response.data;
};

// 면접방 퇴장
export const leaveInterviewRoom = async (
  interviewRequestId: string
): Promise<void> => {
  await del(`/api/interviews/rooms/${interviewRequestId}`);
};

// 면접관 질문 생성
export const createQuestion = async (
  audioFile: Blob
): Promise<ApiResponse<unknown>> => {
  const formData = new FormData();
  formData.append("audioFile", audioFile, "question.webm");

  const response = await axios.post<ApiResponse<unknown>>(
    `${
      import.meta.env.VITE_API_URL || "http://localhost:8080"
    }/api/interviews/question-create`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 면접자 답변 제출
export const submitAnswer = async (
  audioFile: Blob
): Promise<ApiResponse<unknown>> => {
  const formData = new FormData();
  formData.append("audioFile", audioFile, "answer.webm");

  const response = await axios.post<ApiResponse<unknown>>(
    `${
      import.meta.env.VITE_API_URL || "http://localhost:8080"
    }/api/interviews/answer-submit`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
