import { http, HttpResponse } from "msw";

// Mock 면접 질문 데이터
const mockQuestions = [
    {
        id: 1,
        question: "자기소개를 해주세요.",
        category: "기본 질문",
    },
    {
        id: 2,
        question: "지원한 직무에 대한 본인의 강점은 무엇인가요?",
        category: "직무 관련",
    },
    {
        id: 3,
        question: "팀 프로젝트에서 갈등이 발생했을 때 어떻게 해결하셨나요?",
        category: "협업",
    },
    {
        id: 4,
        question: "가장 어려웠던 기술적 문제를 어떻게 해결하셨나요?",
        category: "기술",
    },
    {
        id: 5,
        question: "5년 후 자신의 모습은 어떨 것 같나요?",
        category: "비전",
    },
];

let practiceSessions: Record<
    number,
    {
        id: number;
        interviewerId?: number;
        field?: string;
        questions: typeof mockQuestions;
        answers: Array<{ questionId: number; answer: string }>;
        startedAt: string;
        completedAt?: string;
    }
> = {};

let nextPracticeId = 1;

export const practiceHandlers = [
    // 면접 연습 시작
    http.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/practice/start`,
        async ({ request }) => {
            const body = (await request.json()) as {
                interviewerId?: number;
                field?: string;
            };

            const practiceId = nextPracticeId++;
            const session = {
                id: practiceId,
                interviewerId: body.interviewerId,
                field: body.field,
                questions: mockQuestions,
                answers: [],
                startedAt: new Date().toISOString(),
            };

            practiceSessions[practiceId] = session;

            return HttpResponse.json({
                success: true,
                status: 200,
                data: {
                    practiceId: session.id,
                    questions: session.questions,
                },
                timestamp: new Date().toISOString(),
            });
        }
    ),

    // 면접 연습 세션 조회
    http.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/practice/:id`,
        async ({ params }) => {
            const id = Number(params.id);
            const session = practiceSessions[id];

            if (!session) {
                return HttpResponse.json(
                    {
                        success: false,
                        status: 404,
                        errorCode: "NOT_FOUND",
                        errorMessage: "면접 연습 세션을 찾을 수 없습니다.",
                        timestamp: new Date().toISOString(),
                    },
                    { status: 404 }
                );
            }

            return HttpResponse.json({
                success: true,
                status: 200,
                data: session,
                timestamp: new Date().toISOString(),
            });
        }
    ),

    // 답변 제출
    http.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/practice/:id/answer`,
        async ({ params, request }) => {
            const id = Number(params.id);
            const body = (await request.json()) as {
                questionId: number;
                answer: string;
            };

            const session = practiceSessions[id];

            if (!session) {
                return HttpResponse.json(
                    {
                        success: false,
                        status: 404,
                        errorCode: "NOT_FOUND",
                        errorMessage: "면접 연습 세션을 찾을 수 없습니다.",
                        timestamp: new Date().toISOString(),
                    },
                    { status: 404 }
                );
            }

            // 기존 답변 업데이트 또는 새로 추가
            const existingAnswerIndex = session.answers.findIndex(
                (a) => a.questionId === body.questionId
            );

            if (existingAnswerIndex >= 0) {
                session.answers[existingAnswerIndex].answer = body.answer;
            } else {
                session.answers.push({
                    questionId: body.questionId,
                    answer: body.answer,
                });
            }

            return HttpResponse.json({
                success: true,
                status: 200,
                timestamp: new Date().toISOString(),
            });
        }
    ),

    // 면접 연습 완료
    http.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/practice/:id/complete`,
        async ({ params }) => {
            const id = Number(params.id);
            const session = practiceSessions[id];

            if (!session) {
                return HttpResponse.json(
                    {
                        success: false,
                        status: 404,
                        errorCode: "NOT_FOUND",
                        errorMessage: "면접 연습 세션을 찾을 수 없습니다.",
                        timestamp: new Date().toISOString(),
                    },
                    { status: 404 }
                );
            }

            session.completedAt = new Date().toISOString();

            return HttpResponse.json({
                success: true,
                status: 200,
                data: session,
                timestamp: new Date().toISOString(),
            });
        }
    ),
];

