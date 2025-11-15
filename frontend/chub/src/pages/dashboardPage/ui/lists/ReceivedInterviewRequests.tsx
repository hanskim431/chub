import { useReceivedInterviewRequests } from "../../api/interviewQuery";
import { InterviewRequestItem } from "../components/InterviewRequestItem";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import type { Role } from "../types";

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

    if (requests.length === 0) {
        return <EmptyState message="받은 면접 요청이 없습니다." />;
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

