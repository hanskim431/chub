import { useReceivedInterviewRequests } from "@/pages/dashboardPage/api/interviewQuery";
import { InterviewRequestItem } from "@/pages/dashboardPage/ui/components/InterviewRequestItem";
import { LoadingState } from "@/pages/dashboardPage/ui/components/LoadingState";
import { EmptyState } from "@/pages/dashboardPage/ui/components/EmptyState";
import type { Role } from "@/pages/dashboardPage/ui/types";

interface ReceivedInterviewRequestsProps {
    role: Role;
}

export function ReceivedInterviewRequests({
    role,
}: ReceivedInterviewRequestsProps) {
    const { data, isLoading } = useReceivedInterviewRequests(0, 10);

    if (isLoading) {
        return <LoadingState />;
    }

    const requests = data?.data?.interviewRequests ?? [];
    
    // PENDING 상태인 요청만 필터링 (이중 체크)
    const pendingRequests = requests.filter(
        (request) => request.status === "PENDING"
    );

    if (pendingRequests.length === 0) {
        return <EmptyState message="받은 면접 요청이 없습니다." />;
    }

    return (
        <div className="space-y-4">
            {pendingRequests.map((request) => (
                <InterviewRequestItem
                    key={request.id}
                    request={request}
                    role={role}
                />
            ))}
        </div>
    );
}
