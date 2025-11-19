import { useNavigate } from "react-router-dom";
import Card from "@/shared/ui/Card";
import type { InterviewRecord } from "@/pages/dashboardPage/api/interviewRequests";
import type { Role, TabId } from "@/pages/dashboardPage/ui/types";

interface CompletedInterviewRequestItemProps {
    record: InterviewRecord;
    role: Role;
    activeTab: TabId;
}

export function CompletedInterviewRequestItem({
    record,
    role,
    activeTab,
}: CompletedInterviewRequestItemProps) {
    const navigate = useNavigate();

    const opponentName = record.opponent.name;
    const opponentAvatar = record.opponent.avatar || "/default-avatar.png";
    
    // duration을 분:초 형식으로 변환
    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}분 ${secs}초`;
    };
    
    // date를 한국 시간으로 변환
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Seoul",
        });
    };

    const handleClick = () => {
        navigate(`/interviews/records/${record.id}`, {
            state: { role, activeTab },
        });
    };

    return (
        <div onClick={handleClick} className="cursor-pointer">
            <Card className="p-0 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex items-stretch">
                    {/* 왼쪽 색상 바 */}
                    <div className="bg-blue-100 w-20 flex-shrink-0 flex flex-col items-center justify-center px-2">
                        <span className="text-blue-800 text-lg font-bold whitespace-nowrap [writing-mode:vertical-rl]">
                            완료됨
                        </span>
                    </div>

                    {/* 가운데 콘텐츠 */}
                    <div className="flex items-start gap-4 flex-1 p-4 min-w-0">
                        <img
                            src={opponentAvatar}
                            alt={opponentName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-point-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-text-black mb-2">
                                {opponentName}
                            </h3>
                            <p className="text-sm text-text-gray mb-2">
                                {formatDate(record.date)}
                            </p>
                            <p className="text-sm text-text-black">
                                면접 시간: {formatDuration(record.duration)}
                            </p>
                        </div>
                    </div>

                    {/* 오른쪽 기록 보기 문구 */}
                    <div className="flex-shrink-0 flex items-center p-4">
                        <span className="text-base font-medium text-point whitespace-nowrap">
                            눌러서 기록보기
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
