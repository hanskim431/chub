import Card from "@/shared/ui/Card";
import type { ScheduledInterview } from "@/pages/dashboardPage/api/interviewRequests";
import { ResumeButton } from "@/pages/dashboardPage/ui/components/ResumeButton";
import type { Role } from "@/pages/dashboardPage/ui/types";

interface ScheduledInterviewItemProps {
    interview: ScheduledInterview;
    role: Role;
}

export function ScheduledInterviewItem({
    interview,
    role,
}: ScheduledInterviewItemProps) {
    const intervieweeId =
        role === "interviewer" ? interview.opponent.id : undefined;

    return (
        <Card className="p-0 hover:shadow-lg transition-shadow overflow-hidden">
            <div className="flex items-stretch">
                {/* 왼쪽 색상 바 */}
                <div className="bg-point-100 w-20 flex-shrink-0 flex flex-col items-center justify-center px-2">
                    <span className="text-point-800 text-lg font-bold whitespace-nowrap [writing-mode:vertical-rl]">
                        예정됨
                    </span>
                </div>

                {/* 가운데 콘텐츠 */}
                <div className="flex items-start gap-4 flex-1 p-4 min-w-0">
                    <img
                        src={interview.opponent.avatar}
                        alt={interview.opponent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-point-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-text-black mb-2">
                            {interview.opponent.name}
                        </h3>
                        {interview.opponent.field && (
                            <p className="text-sm text-text-gray mb-2">
                                {interview.opponent.field}
                            </p>
                        )}
                        <p className="text-sm text-text-black line-clamp-2 mb-2">
                            {interview.requestMessage}
                        </p>
                        <p className="text-xs text-text-gray">
                            면접 일시:{" "}
                            {new Date(interview.scheduledAt).toLocaleDateString(
                                "ko-KR",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    </div>
                </div>

                {/* 면접관일 때 이력서 보기 버튼 */}
                {role === "interviewer" && (
                    <div className="flex-shrink-0 p-4">
                        <ResumeButton
                            userId={intervieweeId}
                            userName={interview.opponent.name}
                            role={role}
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}
