import { http, HttpResponse } from "msw";

export const resumeHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/api/resumes/me`, async () => {
    return HttpResponse.json({
      success: true,
      status: 200,
      data: {},
    });
  }),
  http.post(
    `${import.meta.env.VITE_API_URL}/api/resumes/me`,
    async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json({
        success: true,
        status: 200,
        data: body,
      });
    }
  ),
  http.delete(`${import.meta.env.VITE_API_URL}/api/resumes/me`, async () => {
    return HttpResponse.json({
      success: true,
      status: 200,
    });
  }),
];
