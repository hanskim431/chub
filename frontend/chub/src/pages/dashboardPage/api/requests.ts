import { api } from "@/shared/api/api";

export interface DashboardStats {
    receivedRequests: number;
    sentRequests: number;
    scheduledInterviews: number;
    completedInterviews: number;
}

export interface DashboardStatsResponse {
    success: boolean;
    status: number;
    data: DashboardStats;
    timestamp: string;
}

export const getDashboardStats =
    async (): Promise<DashboardStatsResponse | null> => {
        try {
            const response = await api.get<DashboardStatsResponse>(
                "/api/dashboard/stats"
            );
            return response.data;
        } catch (error) {
            console.warn("getDashboardStats API 호출 실패:", error);
            return null;
        }
    };
