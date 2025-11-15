import type { InterviewRequestStatus } from "@/pages/dashboardPage/api/interviewRequests";

export const getStatusColor = (status: InterviewRequestStatus): string => {
    switch (status) {
        case "PENDING":
            return "bg-amber-100";
        case "ACCEPTED":
            return "bg-emerald-100";
        case "REJECTED":
            return "bg-red-100";
        case "COMPLETED":
            return "bg-blue-100";
        case "SCHEDULED":
            return "bg-point-100";
        default:
            return "bg-gray-100";
    }
};

export const getStatusTextColor = (status: InterviewRequestStatus): string => {
    switch (status) {
        case "PENDING":
            return "text-amber-800";
        case "ACCEPTED":
            return "text-emerald-800";
        case "REJECTED":
            return "text-red-800";
        case "COMPLETED":
            return "text-blue-800";
        case "SCHEDULED":
            return "text-point-800";
        default:
            return "text-gray-800";
    }
};

export const getStatusLabel = (status: InterviewRequestStatus): string => {
    switch (status) {
        case "PENDING":
            return "대기 중";
        case "ACCEPTED":
            return "수락됨";
        case "REJECTED":
            return "거절됨";
        case "COMPLETED":
            return "완료됨";
        case "SCHEDULED":
            return "예정됨";
        default:
            return status;
    }
};

