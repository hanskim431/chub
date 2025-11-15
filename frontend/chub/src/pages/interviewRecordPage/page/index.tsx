import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useInterviewRecord } from "../api/query";
import Card from "@/shared/ui/Card";

export default function InterviewRecordPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data, isLoading, error } = useInterviewRecord(Number(id));

    // location.state에서 탭 정보 가져오기
    const state = location.state as
        | { role?: "interviewee" | "interviewer"; activeTab?: string }
        | null
        | undefined;

    const handleBackToDashboard = () => {
        navigate("/dashboard", {
            state: state
                ? { role: state.role, activeTab: state.activeTab }
                : undefined,
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="text-gray-500">
                        면접 기록을 불러올 수 없습니다.
                    </div>
                    <button
                        onClick={handleBackToDashboard}
                        className="px-4 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
                    >
                        대시보드로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const record = data.data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={handleBackToDashboard}
                    className="text-gray-600 hover:text-point transition-colors mb-4"
                >
                    ← 대시보드로 돌아가기
                </button>
                <h1 className="text-3xl font-bold mb-2">면접 기록</h1>
                <p className="text-gray-600">
                    {new Date(record.completedAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>

            {/* 면접관/면접자 정보 */}
            <Card height="fit" className="py-3 px-4 mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <img
                            src={record.interviewer.avatar}
                            alt={record.interviewer.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-point-100"
                        />
                        <div>
                            <p className="text-sm text-gray-600 mb-1">면접관</p>
                            <p className="text-lg font-bold">
                                {record.interviewer.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                {record.interviewer.field}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                        <img
                            src={record.interviewee.avatar}
                            alt={record.interviewee.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-point-100"
                        />
                        <div>
                            <p className="text-sm text-gray-600 mb-1">면접자</p>
                            <p className="text-lg font-bold">
                                {record.interviewee.name}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 질문과 답변 */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">질문과 답변</h2>
                {record.questionsAndAnswers.length === 0 ? (
                    <Card className="p-6">
                        <p className="text-gray-500 text-center">
                            질문과 답변 기록이 없습니다.
                        </p>
                    </Card>
                ) : (
                    record.questionsAndAnswers.map((qa, index) => (
                        <Card key={index} className="p-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-point bg-point-100 px-2 py-1 rounded">
                                        질문 {index + 1}
                                    </span>
                                </div>
                                <p className="text-lg text-text-black">
                                    {qa.question}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                        답변
                                    </span>
                                </div>
                                <p className="text-base text-text-black whitespace-pre-wrap">
                                    {qa.answer}
                                </p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
