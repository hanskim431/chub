import { api } from "@/shared/api/api";

export type InterviewRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "SCHEDULED";

export interface Interviewer {
  id: number;
  name: string;
  avatar: string;
  field: string;
}

export interface Interviewee {
  id: number;
  name: string;
  avatar: string;
  field?: string;
}

export interface InterviewRequest {
  id: number;
  interviewer: Interviewer;
  interviewee?: Interviewee; // 면접관이 받은 요청일 때 면접 신청자 정보
  status: InterviewRequestStatus;
  requestMessage: string;
  createdAt: string;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface InterviewRequestsResponse {
  success: boolean;
  status: string;
  data: {
    interviewRequests: InterviewRequest[];
  };
  pageInfo: PageInfo;
  timestamp: string;
}

export interface GetInterviewRequestsParams {
  status?: InterviewRequestStatus;
  page?: number;
  size?: number;
}

export const getInterviewRequests = async ({
  status,
  page = 0,
  size = 10,
}: GetInterviewRequestsParams): Promise<InterviewRequestsResponse | null> => {
  try {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
    };
    if (status) {
      params.status = status;
    }
    const response = await api.get<InterviewRequestsResponse>(
      "/api/interviews/requests/me",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.warn("getInterviewRequests API 호출 실패:", error);
    return null;
  }
};

export const getReceivedInterviewRequests = async ({
  page = 0,
  size = 10,
  status,
}: {
  page?: number;
  size?: number;
  status?: InterviewRequestStatus;
}): Promise<InterviewRequestsResponse | null> => {
  try {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
    };
    if (status) {
      params.status = status;
    }
    const response = await api.get<InterviewRequestsResponse>(
      "/api/interviews/requests/received",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.warn("getReceivedInterviewRequests API 호출 실패:", error);
    return null;
  }
};

export interface ScheduledInterview {
  id: number;
  requestId: number;
  requestMessage: string;
  opponent: {
    id: number;
    name: string;
    avatar: string;
    field?: string;
  };
  scheduledAt: string;
  status: string;
  roomID: number;
  myRole?: "interviewer" | "interviewee"; // 내 역할 정보 (면접관인지 면접자인지)
}

export interface ScheduledInterviewsResponse {
  success: boolean;
  status: string;
  data: {
    interviews: ScheduledInterview[];
  };
  timestamp: string;
}

export const getScheduledInterviews =
  async (): Promise<ScheduledInterviewsResponse | null> => {
    try {
      const response = await api.get<ScheduledInterviewsResponse>(
        "/api/interviews/scheduled"
      );
      return response.data;
    } catch (error) {
      console.warn("getScheduledInterviews API 호출 실패:", error);
      return null;
    }
  };

export interface UpdateInterviewRequestStatusRequest {
  accepted: boolean;
}

export interface UpdateInterviewRequestStatusResponse {
  success: boolean;
  status: string;
  timestamp: string;
}

export const updateInterviewRequestStatus = async (
  id: number,
  accepted: boolean
): Promise<UpdateInterviewRequestStatusResponse | null> => {
  try {
    const response = await api.patch<UpdateInterviewRequestStatusResponse>(
      `/api/interviews/requests/${id}/status`,
      { accepted }
    );
    return response.data;
  } catch (error) {
    console.warn("updateInterviewRequestStatus API 호출 실패:", error);
    return null;
  }
};
