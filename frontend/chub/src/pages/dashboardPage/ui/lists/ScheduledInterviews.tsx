import { useScheduledInterviews } from "../../api/interviewQuery";
import { ScheduledInterviewItem } from "../components/ScheduledInterviewItem";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import type { Role } from "../types";

interface ScheduledInterviewsProps {
    role: Role;
}

export function ScheduledInterviews({ role }: ScheduledInterviewsProps) {
    const { data, isLoading } = useScheduledInterviews();

    if (isLoading) {
        return <LoadingState />;
    }

    const interviews = data?.data?.interviews ?? [];

    if (interviews.length === 0) {
        return <EmptyState message="예정된 면접이 없습니다." />;
    }

    return (
        <div className="space-y-4">
            {interviews.map((interview) => (
                <ScheduledInterviewItem
                    key={interview.id}
                    interview={interview}
                    role={role}
                />
            ))}
        </div>
    );
}

