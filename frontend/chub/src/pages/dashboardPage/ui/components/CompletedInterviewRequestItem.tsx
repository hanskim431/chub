import { useNavigate } from "react-router-dom";
import Card from "@/shared/ui/Card";
import type { InterviewRequest } from "../../api/interviewRequests";
import type { Role, TabId } from "../types";

interface CompletedInterviewRequestItemProps {
    request: InterviewRequest;
    role: Role;
    activeTab: TabId;
}

export function CompletedInterviewRequestItem({
    request,
    role,
    activeTab,
}: CompletedInterviewRequestItemProps) {
    const navigate = useNavigate();

    const opponentName = request.interviewer.name;
    const opponentField = request.interviewer.field;
    const opponentAvatar = request.interviewer.avatar;

    const handleClick = () => {
        navigate(`/interviews/records/${request.id}`, {
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
                                {opponentField}
                            </p>
                            <p className="text-sm text-text-black line-clamp-2 mb-2">
                                {request.requestMessage}
                            </p>
                            <p className="text-xs text-text-gray">
                                {new Date(request.createdAt).toLocaleDateString(
                                    "ko-KR",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
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

