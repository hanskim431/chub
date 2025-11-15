import { useInterviewRequests } from "@/pages/dashboardPage/api/interviewQuery";
import { InterviewRequestItem } from "@/pages/dashboardPage/ui/components/InterviewRequestItem";
import { LoadingState } from "@/pages/dashboardPage/ui/components/LoadingState";
import { EmptyState } from "@/pages/dashboardPage/ui/components/EmptyState";
import type { Role } from "@/pages/dashboardPage/ui/types";

interface CancelledInterviewRequestsProps {
    role: Role;
}

export function CancelledInterviewRequests({
    role,
}: CancelledInterviewRequestsProps) {
    const { data, isLoading } = useInterviewRequests({
        status: "REJECTED",
        page: 0,
        size: 10,
    });

    if (isLoading) {
        return <LoadingState />;
    }

    const requests = data?.data?.interviewRequests ?? [];

    if (requests.length === 0) {
        return <EmptyState message="취소된 요청이 없습니다." />;
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

