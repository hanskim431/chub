import { useScheduledInterviews } from "@/pages/dashboardPage/api/interviewQuery";
import { ScheduledInterviewItem } from "@/pages/dashboardPage/ui/components/ScheduledInterviewItem";
import { LoadingState } from "@/pages/dashboardPage/ui/components/LoadingState";
import { EmptyState } from "@/pages/dashboardPage/ui/components/EmptyState";
import type { Role } from "@/pages/dashboardPage/ui/types";
import { useMemo } from "react";

interface ScheduledInterviewsProps {
  role: Role;
}

export function ScheduledInterviews({ role }: ScheduledInterviewsProps) {
  const { data, isLoading } = useScheduledInterviews();

  if (isLoading) {
    return <LoadingState />;
  }

  const allInterviews = data?.data?.interviews ?? [];

  // 현재 역할에 맞는 예정된 면접만 필터링
  const interviews = useMemo(() => {
    return allInterviews.filter((interview) => {
      // API 응답에 myRole이 있으면 그것을 사용
      if (interview.myRole) {
        return interview.myRole === role;
      }
      // myRole이 없으면 기본적으로 모든 면접 표시 (하위 호환성)
      return true;
    });
  }, [allInterviews, role]);

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
