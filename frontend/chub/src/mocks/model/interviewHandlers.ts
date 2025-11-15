import { http, HttpResponse } from "msw";

interface Interviewer {
    id: string;
    name: string;
    avatar: string;
    field: string;
}

const interviewer: Interviewer[] = [
    {
        id: "1",
        name: "강진구",
        avatar: "/logo.png",
        field: "핀테크 백엔드 엔지니어",
    },
    {
        id: "2",
        name: "배수헌",
        avatar: "/logo.png",
        field: "게임 개발 서버 엔지니어",
    },
    {
        id: "3",
        name: "유은지",
        avatar: "/logo.png",
        field: "백엔드 개발자",
    },
    {
        id: "4",
        name: "김한수",
        avatar: "/logo.png",
        field: "백엔드 개발자",
    },
    {
        id: "5",
        name: "이뜨",
        avatar: "/logo.png",
        field: "엔지니어 솔루션 플랫폼 프론트앤드 개발자",
    },
];

export const interviewHandlers = [
    // 인터뷰 요청
    http.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/requests`,
        async () => {
            return HttpResponse.json({
                success: true,
                status: 200,
                timestamp: new Date().toISOString(),
            });
        }
    ),
    // 인터뷰 신청 수락 / 거절
    http.patch(
        `${import.meta.env.VITE_API_URL}/api/interviews/requests/:id/status`,
        async () => {
            return HttpResponse.json({
                success: true,
                status: 200,
                timestamp: new Date().toISOString(),
            });
        }
    ),

    //인터뷰 신청 목록
    http.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/requests/me`,
        async ({ request }) => {
            const url = new URL(request.url);
            const status = url.searchParams.get("status") || undefined;
            const page = parseInt(url.searchParams.get("page") || "0");
            const size = parseInt(url.searchParams.get("size") || "10");

            const filteredInterviewers = interviewer.map((iv, index) => ({
                id: index + 1,
                interviewer: {
                    id: parseInt(iv.id),
                    name: iv.name,
                    avatar: iv.avatar,
                    field: iv.field,
                },
                status:
                    (status as
                        | "PENDING"
                        | "ACCEPTED"
                        | "REJECTED"
                        | "COMPLETED") || "PENDING",
                requestMessage: `안녕하세요, ${iv.name}님께 면접을 신청합니다.`,
                createdAt: new Date().toISOString(),
            }));

            return HttpResponse.json({
                success: true,
                status: "200",
                data: {
                    interviewRequests: filteredInterviewers,
                },
                pageInfo: {
                    page,
                    size,
                    totalElements: filteredInterviewers.length,
                    totalPages: Math.ceil(filteredInterviewers.length / size),
                    first: page === 0,
                    last:
                        page >=
                        Math.ceil(filteredInterviewers.length / size) - 1,
                },
                timestamp: new Date().toISOString(),
            });
        }
    ),

    //받은 인터뷰 신청 목록
    http.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/requests/received`,
        async ({ request }) => {
            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get("page") || "0");
            const size = parseInt(url.searchParams.get("size") || "10");

            const receivedRequests = interviewer.map((iv, index) => ({
                id: index + 1,
                interviewer: {
                    id: parseInt(iv.id),
                    name: iv.name,
                    avatar: iv.avatar,
                    field: iv.field,
                },
                interviewee: {
                    id: 1, // 면접 신청자 ID (현재 사용자)
                    name: "이찬",
                    avatar: "/logo.png",
                    field: "백엔드 개발자",
                },
                status: "PENDING" as const,
                requestMessage: `안녕하세요, ${iv.name}입니다. 인터뷰 신청합니다.`,
                createdAt: new Date().toISOString(),
            }));

            return HttpResponse.json({
                success: true,
                status: "200",
                data: {
                    interviewRequests: receivedRequests,
                },
                pageInfo: {
                    page,
                    size,
                    totalElements: receivedRequests.length,
                    totalPages: Math.ceil(receivedRequests.length / size),
                    first: page === 0,
                    last: page >= Math.ceil(receivedRequests.length / size) - 1,
                },
                timestamp: new Date().toISOString(),
            });
        }
    ),

    //예정된 인터뷰 목록
    http.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/scheduled`,
        async () => {
            const scheduledInterviews = interviewer.map((iv, index) => ({
                id: parseInt(iv.id) + 100,
                requestId: parseInt(iv.id),
                requestMessage: `안녕하세요, ${iv.name}님과의 면접이 예정되어 있습니다.`,
                opponent: {
                    id: 1, // 면접 신청자 ID (면접관이 받은 요청일 때)
                    name: "이찬",
                    avatar: "/logo.png",
                    field: "백엔드 개발자",
                },
                scheduledAt: new Date(
                    Date.now() + (index + 1) * 24 * 60 * 60 * 1000
                ).toISOString(),
                status: "scheduled",
                roomID: parseInt(iv.id) + 1000,
            }));

            return HttpResponse.json({
                success: true,
                status: "200",
                data: {
                    interviews: scheduledInterviews,
                },
                timestamp: new Date().toISOString(),
            });
        }
    ),

    // 면접 기록 조회
    http.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/records/:id`,
        async ({ params }) => {
            const id = parseInt(params.id as string);
            const iv = interviewer[id % interviewer.length];

            return HttpResponse.json({
                success: true,
                status: "200",
                data: {
                    id: id + 1000,
                    requestId: id,
                    interviewer: {
                        id: parseInt(iv.id),
                        name: iv.name,
                        avatar: iv.avatar,
                        field: iv.field,
                    },
                    interviewee: {
                        id: 999,
                        name: "면접자",
                        avatar: "/logo.png",
                    },
                    completedAt: new Date().toISOString(),
                    questionsAndAnswers: [
                        {
                            question: "자기소개를 해주세요.",
                            answer: "안녕하세요. 저는 백엔드 개발자로 3년간 경력을 쌓아왔습니다. 주로 Java와 Spring Boot를 사용하여 웹 애플리케이션을 개발했습니다.",
                        },
                        {
                            question:
                                "가장 도전적이었던 프로젝트는 무엇인가요?",
                            answer: "대규모 트래픽을 처리해야 하는 프로젝트에서 성능 최적화를 담당했던 경험이 가장 도전적이었습니다. 데이터베이스 쿼리 최적화와 캐싱 전략을 통해 응답 시간을 50% 이상 단축할 수 있었습니다.",
                        },
                        {
                            question: "팀워크에 대해 어떻게 생각하시나요?",
                            answer: "개발은 혼자 하는 것이 아니라 팀과 함께 하는 것이라고 생각합니다. 코드 리뷰를 통해 서로의 코드를 검토하고, 지식을 공유하며 함께 성장하는 것이 중요하다고 생각합니다.",
                        },
                    ],
                },
                timestamp: new Date().toISOString(),
            });
        }
    ),
];
