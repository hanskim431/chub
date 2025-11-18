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

  // 면접 시작 가능 여부 확인 (30분 전부터 활성화)
  const scheduledTime = new Date(interview.scheduledAt).getTime();
  const currentTime = new Date().getTime();
  const thirtyMinutesBefore = scheduledTime - 30 * 60 * 1000;
  const canStart = currentTime >= thirtyMinutesBefore;

  // 남은 시간 계산
  const getTimeUntilStart = () => {
    if (canStart) return null;

    const timeDiff = thirtyMinutesBefore - currentTime;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days}일`);
    }
    if (hours > 0) {
      parts.push(`${hours}시간`);
    }
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes}분`);
    }

    return `${parts.join(" ")} 후 시작 가능`;
  };

  const handleStartInterview = () => {
    // 면접방 ID는 requestId를 사용 (WebSocket 명세상 interviewRequestId)
    // roomID가 있으면 사용하고, 없으면 requestId 사용
    const roomId = interview.id;
    if (!roomId) {
      console.error("면접방 ID를 찾을 수 없습니다:", interview);
      alert("면접방 정보를 불러올 수 없습니다.");
      return;
    }
    navigate(`/interviews/room/${roomId}`);
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
              {new Date(interview.scheduledAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* 오른쪽 버튼 영역 */}
        <div className="flex-shrink-0 p-4 flex flex-col gap-2 justify-center">
          {/* 면접 시작 버튼 */}
          {canStart ? (
            <button
              onClick={handleStartInterview}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
              title="면접 시작하기"
            >
              면접 시작하기
            </button>
          ) : (
            <div className="px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-600 text-center text-sm">
              {getTimeUntilStart()}
            </div>
          )}

          {/* 면접관일 때 이력서 보기 버튼 */}
          {role === "interviewer" && (
            <ResumeButton
              userId={intervieweeId}
              userName={interview.opponent.name}
              role={role}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
