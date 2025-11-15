import { useInterviewRequests } from "../../api/interviewQuery";
import { CompletedInterviewRequestItem } from "../components/CompletedInterviewRequestItem";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import type { Role, TabId } from "../types";

interface CompletedInterviewsProps {
    role: Role;
    activeTab: TabId;
}

export function CompletedInterviews({
    role,
    activeTab,
}: CompletedInterviewsProps) {
    const { data, isLoading } = useInterviewRequests({
        status: "COMPLETED",
        page: 0,
        size: 10,
    });

    if (isLoading) {
        return <LoadingState />;
    }

    const requests = data?.data?.interviewRequests ?? [];

    if (requests.length === 0) {
        return <EmptyState message="완료된 면접이 없습니다." />;
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <CompletedInterviewRequestItem
                    key={request.id}
                    request={request}
                    role={role}
                    activeTab={activeTab}
                />
            ))}
        </div>
    );
}

