import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const intervieweeId =
        role === "interviewer" ? interview.opponent.id : undefined;

    const handleStartInterview = () => {
        navigate(`/interviews/room/${interview.roomID}`);
    };

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

                {/* 오른쪽 액션 버튼 영역 */}
                <div className="flex-shrink-0 flex flex-row gap-3 p-4 items-center">
                    {role === "interviewer" && (
                        <ResumeButton
                            userId={intervieweeId}
                            userName={interview.opponent.name}
                            role={role}
                        />
                    )}
                    <button
                        onClick={handleStartInterview}
                        className="px-6 py-3 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
                    >
                        면접 시작하기
                    </button>
                </div>
            </div>
        </Card>
    );
}
