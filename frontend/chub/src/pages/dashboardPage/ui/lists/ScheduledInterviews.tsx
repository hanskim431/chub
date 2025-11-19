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

  const allInterviews = data?.data?.interviews ?? [];

  // 현재 역할에 맞는 예정된 면접만 필터링 (조건부 렌더링 전에 훅 호출)
  const interviews = useMemo(() => {
    return allInterviews.filter((interview) => {
      // API 응답에 myRole이 있으면 그것을 사용하여 필터링
      if (interview.myRole) {
        // role이 "interviewer"이면 "interviewer"만, "interviewee"이면 "interviewee"만 표시
        return interview.myRole === role;
      }
      // myRole이 없으면 필터링하지 않음 (API에서 이미 필터링된 것으로 가정)
      return false;
    });
  }, [allInterviews, role]);

  if (isLoading) {
    return <LoadingState />;
  }

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
