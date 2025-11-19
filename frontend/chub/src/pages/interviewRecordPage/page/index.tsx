import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useInterviewRecord } from "@/pages/interviewRecordPage/api/query";
import Card from "@/shared/ui/Card";
import { useMe } from "@/features/auth/api/me";

export default function InterviewRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error } = useInterviewRecord(Number(id));
  const { data: meData } = useMe();
  const currentUserId = meData?.data?.id;

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

  // transcript를 질문과 답변으로 변환
  const questionsAndAnswers = useMemo(() => {
    if (!data?.data?.transcript) return [];

    const transcript = data.data.transcript;
    const qaList: Array<{ question: string; answer: string }> = [];
    let currentQuestion = "";
    let currentAnswer = "";

    for (const item of transcript) {
      if (item.speaker === "interviewer") {
        // 이전 질문-답변 쌍 저장 (질문이나 답변이 하나라도 있으면)
        if (currentQuestion || currentAnswer) {
          qaList.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
          });
        }
        // 새 질문 시작
        currentQuestion = item.text || "";
        currentAnswer = "";
      } else if (item.speaker === "interviewee") {
        // 답변 추가 (빈 문자열도 포함)
        if (item.text !== undefined) {
          currentAnswer += (currentAnswer ? " " : "") + (item.text || "");
        }
      }
    }

    // 마지막 질문-답변 쌍 저장 (질문이나 답변이 하나라도 있으면)
    if (currentQuestion || currentAnswer) {
      qaList.push({
        question: currentQuestion.trim(),
        answer: currentAnswer.trim(),
      });
    }

    return qaList;
  }, [data?.data?.transcript]);

  // 면접관/면접자 정보 결정
  const { interviewer, interviewee } = useMemo(() => {
    if (!data?.data) {
      return { interviewer: null, interviewee: null };
    }

    const record = data.data;
    const isInterviewer = record.role === "interviewer";

    // 현재 사용자가 면접관이면 opponent가 면접자, 아니면 opponent가 면접관
    if (isInterviewer) {
      // 현재 사용자가 면접관인 경우, opponent는 면접자
      // 면접관 정보는 현재 사용자 정보를 사용해야 하지만, API에서 제공하지 않으므로 opponent를 면접관으로 표시
      // 실제로는 백엔드에서 면접관 정보도 제공해야 함
      return {
        interviewer: {
          id: currentUserId || 0,
          name: "나",
          avatar: meData?.data?.avatar || "/default-avatar.png",
        },
        interviewee: record.opponent,
      };
    } else {
      // 현재 사용자가 면접자인 경우, opponent는 면접관
      return {
        interviewer: record.opponent,
        interviewee: {
          id: currentUserId || 0,
          name: "나",
          avatar: meData?.data?.avatar || "/default-avatar.png",
        },
      };
    }
  }, [data?.data, currentUserId, meData?.data?.avatar]);

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
          <div className="text-gray-500">면접 기록을 불러올 수 없습니다.</div>
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

  // duration을 분:초 형식으로 변환
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

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
        <div className="flex items-center gap-4 text-gray-600">
          <p>
            {new Date(record.date).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Seoul",
            })}
          </p>
          <span>•</span>
          <p>면접 시간: {formatDuration(record.duration)}</p>
        </div>
      </div>

      {/* 면접관/면접자 정보 */}
      {interviewer && interviewee && (
        <Card height="fit" className="py-3 px-4 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <img
                src={interviewer.avatar || "/default-avatar.png"}
                alt={interviewer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-point-100"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <div>
                <p className="text-sm text-gray-600 mb-1">면접관</p>
                <p className="text-lg font-bold">{interviewer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-1">
              <img
                src={interviewee.avatar || "/default-avatar.png"}
                alt={interviewee.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-point-100"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <div>
                <p className="text-sm text-gray-600 mb-1">면접자</p>
                <p className="text-lg font-bold">{interviewee.name}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 질문과 답변 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">면접 대화 기록</h2>
        {questionsAndAnswers.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-500 text-center">
              질문과 답변 기록이 없습니다.
            </p>
          </Card>
        ) : (
          questionsAndAnswers.map((qa, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-point bg-point-100 px-2 py-1 rounded">
                    질문 {index + 1}
                  </span>
                </div>
                <p className="text-lg text-text-black">{qa.question}</p>
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
