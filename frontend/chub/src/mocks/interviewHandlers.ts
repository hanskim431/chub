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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    async ({ params }) => {
      const { status, page, size } = params as {
        status: string;
        page: string;
        size: string;
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          interviewRequests: interviewer.map((interviewer) => ({
            ...interviewer,
            status: status,
            requestMessage: `안녕하세요, ${interviewer.name}입니다. 인터뷰 신청합니다.`,
            createdAt: new Date().toISOString(),
          })),
          pageInfo: {
            page: parseInt(page),
            size: parseInt(size),
            totalElements: interviewer.length,
            totalPages: Math.ceil(interviewer.length / parseInt(size)),
            first: page === "0",
            last:
              parseInt(page) ===
              Math.ceil(interviewer.length / parseInt(size)) - 1,
          },
        },
      });
    }
  ),

  //받은 인터뷰 신청 목록
  http.get(
    `${import.meta.env.VITE_API_URL}/api/interviews/requests/received`,
    async ({ params }) => {
      const { page, size } = params as {
        page: string;
        size: string;
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          interviewRequests: interviewer.map((interviewer) => ({
            ...interviewer,
            status: "PENDING",
            requestMessage: `안녕하세요, ${interviewer.name}입니다. 인터뷰 신청합니다.`,
            createdAt: new Date().toISOString(),
          })),
          pageInfo: {
            page: parseInt(page),
            size: parseInt(size),
            totalElements: interviewer.length,
            totalPages: Math.ceil(interviewer.length / parseInt(size)),
            first: page === "0",
            last:
              parseInt(page) ===
              Math.ceil(interviewer.length / parseInt(size)) - 1,
          },
        },
      });
    }
  ),

  //예정된 인터뷰 목록
  http.get(
    `${import.meta.env.VITE_API_URL}/api/interviews/scheduled`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          interviews: [
            interviewer.map((interviewer) => ({
              id: interviewer.id + 100,
              requestId: interviewer.id,
              requestMessage: `안녕하세요, ${interviewer.name}입니다. 인터뷰 신청합니다.`,
              opponent: {
                id: interviewer.id,
                name: interviewer.name,
                avatar: interviewer.avatar,
              },
              scheduledAt: new Date().toISOString(),
              status: "scheduled",
              roomID: interviewer.id + 1000,
            })),
          ],
        },
      });
    }
  ),
];
