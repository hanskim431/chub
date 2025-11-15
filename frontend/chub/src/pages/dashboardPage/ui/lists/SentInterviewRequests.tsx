import { useInterviewRequests } from "@/pages/dashboardPage/api/interviewQuery";
import type { InterviewRequestStatus } from "@/pages/dashboardPage/api/interviewRequests";
import { InterviewRequestItem } from "@/pages/dashboardPage/ui/components/InterviewRequestItem";
import { LoadingState } from "@/pages/dashboardPage/ui/components/LoadingState";
import { EmptyState } from "@/pages/dashboardPage/ui/components/EmptyState";
import type { Role } from "@/pages/dashboardPage/ui/types";

interface SentInterviewRequestsProps {
    status?: InterviewRequestStatus;
    role: Role;
}

export function SentInterviewRequests({
    status,
    role,
}: SentInterviewRequestsProps) {
    const { data, isLoading } = useInterviewRequests({
        status,
        page: 0,
        size: 10,
    });

    if (isLoading) {
        return <LoadingState />;
    }

    const requests = data?.data?.interviewRequests ?? [];

    if (requests.length === 0) {
        return <EmptyState message="면접 요청이 없습니다." />;
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <InterviewRequestItem
                    key={request.id}
                    request={request}
                    role={role}
                />
            ))}
        </div>
    );
}

