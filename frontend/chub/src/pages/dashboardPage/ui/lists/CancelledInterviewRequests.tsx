import { useInterviewRequests } from "../../api/interviewQuery";
import { InterviewRequestItem } from "../components/InterviewRequestItem";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import type { Role } from "../types";

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

