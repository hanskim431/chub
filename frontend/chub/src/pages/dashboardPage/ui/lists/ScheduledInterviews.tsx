import { useScheduledInterviews } from "@/pages/dashboardPage/api/interviewQuery";
import { ScheduledInterviewItem } from "@/pages/dashboardPage/ui/components/ScheduledInterviewItem";
import { LoadingState } from "@/pages/dashboardPage/ui/components/LoadingState";
import { EmptyState } from "@/pages/dashboardPage/ui/components/EmptyState";
import type { Role } from "@/pages/dashboardPage/ui/types";

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

