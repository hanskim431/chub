import { http, HttpResponse } from "msw";

export const dashboardHandlers = [
  // 대시보드 통계 조회
  http.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({
      success: true,
      status: 200,
      data: {
        receivedRequests: 0,
        sentRequests: 0,
        scheduledInterviews: 0,
        completedInterviews: 0,
      },
      timestamp: new Date().toISOString(),
    });
  }),
];
