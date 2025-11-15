import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/shared/ui/Card";
import {
    useInterviewSession,
    useStartInterview,
    useSubmitInterviewAnswer,
    useCompleteInterview,
} from "@/pages/interviewRoomPage/api/query";
import type { InterviewAnswer } from "@/pages/interviewRoomPage/api/requests";

export default function InterviewRoomPage() {
    const navigate = useNavigate();
    const { roomID } = useParams<{ roomID: string }>();
    const { data: sessionData, isLoading: isLoadingSession } =
        useInterviewSession(roomID ? Number(roomID) : undefined);
    const { mutate: startInterview, isPending: isStarting } =
        useStartInterview();
    const { mutate: submitAnswer, isPending: isSubmitting } =
        useSubmitInterviewAnswer();
    const { mutate: completeInterview, isPending: isCompleting } =
        useCompleteInterview();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentAnswer, setCurrentAnswer] = useState("");

    const session = sessionData?.data?.data;
    const questions = session?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // 세션이 로드되면 답변 초기화
    useEffect(() => {
        if (session?.answers) {
            const answersMap: Record<number, string> = {};
            session.answers.forEach((answer) => {
                answersMap[answer.questionId] = answer.answer;
            });
            setAnswers(answersMap);
        }
    }, [session]);

    // 현재 질문이 변경되면 답변 업데이트
    useEffect(() => {
        if (currentQuestion) {
            setCurrentAnswer(answers[currentQuestion.id] || "");
        }
    }, [currentQuestion, answers]);

    // 면접 시작
    const handleStartInterview = () => {
        if (!roomID) return;

        startInterview(Number(roomID), {
            onSuccess: () => {
                // 세션 다시 로드
            },
            onError: () => {
                alert("면접을 시작할 수 없습니다.");
            },
        });
    };

    // 답변 저장
    const handleSaveAnswer = () => {
        if (!roomID || !currentQuestion) return;

        const answer: InterviewAnswer = {
            questionId: currentQuestion.id,
            answer: currentAnswer,
        };

        submitAnswer(
            { roomID: Number(roomID), answer },
            {
                onSuccess: () => {
                    setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: currentAnswer,
                    }));
                },
                onError: () => {
                    alert("답변 저장에 실패했습니다.");
                },
            }
        );
    };

    // 다음 질문으로 이동
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            handleSaveAnswer();
            setCurrentQuestionIndex((prev) => prev + 1);
            const nextQuestion = questions[currentQuestionIndex + 1];
            setCurrentAnswer(answers[nextQuestion.id] || "");
        }
    };

    // 이전 질문으로 이동
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            handleSaveAnswer();
            setCurrentQuestionIndex((prev) => prev - 1);
            const prevQuestion = questions[currentQuestionIndex - 1];
            setCurrentAnswer(answers[prevQuestion.id] || "");
        }
    };

    // 면접 완료
    const handleComplete = () => {
        if (!roomID) return;

        handleSaveAnswer();
        completeInterview(Number(roomID), {
            onSuccess: () => {
                alert("면접이 완료되었습니다.");
                navigate("/dashboard");
            },
            onError: () => {
                alert("면접 완료에 실패했습니다.");
            },
        });
    };

    // 로딩 중
    if (isLoadingSession) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </div>
        );
    }

    // 세션이 없으면 에러
    if (!session) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="p-8">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">
                            면접 세션을 불러올 수 없습니다.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-4 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
                        >
                            대시보드로 돌아가기
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // 면접이 시작되지 않았으면 시작 화면
    if (!session.startedAt) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">면접 준비</h1>
                        <div className="mb-8">
                            <div className="flex items-center justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <img
                                        src={session.interviewer.avatar}
                                        alt={session.interviewer.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-point-100 mx-auto mb-2"
                                    />
                                    <p className="text-sm text-gray-600 mb-1">
                                        면접관
                                    </p>
                                    <p className="font-bold">
                                        {session.interviewer.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {session.interviewer.field}
                                    </p>
                                </div>
                                <div className="text-2xl text-gray-400">VS</div>
                                <div className="text-center">
                                    <img
                                        src={session.interviewee.avatar}
                                        alt={session.interviewee.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-point-100 mx-auto mb-2"
                                    />
                                    <p className="text-sm text-gray-600 mb-1">
                                        면접자
                                    </p>
                                    <p className="font-bold">
                                        {session.interviewee.name}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                면접을 시작하시겠습니까?
                            </p>
                        </div>
                        <button
                            onClick={handleStartInterview}
                            disabled={isStarting}
                            className="px-8 py-4 bg-point text-white rounded-lg font-semibold text-lg hover:bg-point-500 transition-colors disabled:opacity-50"
                        >
                            {isStarting ? "시작 중..." : "면접 시작하기"}
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    const isLastQuestion =
        currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-600 hover:text-point transition-colors mb-4"
                >
                    ← 대시보드로 돌아가기
                </button>
                <h1 className="text-3xl font-bold mb-2">면접 진행</h1>
                <p className="text-gray-600">
                    질문 {currentQuestionIndex + 1} / {questions.length}
                </p>
            </div>

            {/* 면접관/면접자 정보 */}
            <Card className="p-4 mb-6">
                <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                        <img
                            src={session.interviewer.avatar}
                            alt={session.interviewer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-point-100 mx-auto mb-1"
                        />
                        <p className="text-xs text-gray-600">면접관</p>
                        <p className="text-sm font-bold">
                            {session.interviewer.name}
                        </p>
                    </div>
                    <div className="text-gray-400">VS</div>
                    <div className="text-center">
                        <img
                            src={session.interviewee.avatar}
                            alt={session.interviewee.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-point-100 mx-auto mb-1"
                        />
                        <p className="text-xs text-gray-600">면접자</p>
                        <p className="text-sm font-bold">
                            {session.interviewee.name}
                        </p>
                    </div>
                </div>
            </Card>

            {/* 진행 상황 표시 */}
            <Card className="p-4 mb-6">
                <div className="flex gap-2">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`flex-1 h-2 rounded ${
                                index < currentQuestionIndex
                                    ? "bg-emerald-500"
                                    : index === currentQuestionIndex
                                    ? "bg-point"
                                    : "bg-gray-200"
                            }`}
                        />
                    ))}
                </div>
            </Card>

            {/* 질문 카드 */}
            {currentQuestion && (
                <Card className="p-6 mb-6">
                    <div className="mb-4">
                        <span className="text-sm font-semibold text-point bg-point-100 px-3 py-1 rounded">
                            질문 {currentQuestionIndex + 1}
                        </span>
                        {currentQuestion.category && (
                            <span className="ml-2 text-sm text-gray-600">
                                ({currentQuestion.category})
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-text-black mb-6">
                        {currentQuestion.question}
                    </h2>

                    {/* 답변 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            답변
                        </label>
                        <textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-point resize-none"
                            placeholder="답변을 입력하세요..."
                        />
                    </div>
                </Card>
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between gap-4">
                <button
                    onClick={handlePreviousQuestion}
                    disabled={isFirstQuestion || isSubmitting}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    이전 질문
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={handleSaveAnswer}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "저장 중..." : "답변 저장"}
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting || isSubmitting}
                            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {isCompleting ? "완료 중..." : "면접 완료"}
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors disabled:opacity-50"
                        >
                            다음 질문
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

