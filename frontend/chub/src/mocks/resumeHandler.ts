import { http, HttpResponse } from "msw";

export const resumeHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/api/resumes/me`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        status: 200,
        data: body,
      });
    }
  ),
  http.delete(`${import.meta.env.VITE_API_URL}/api/resumes/me`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({
      success: true,
      status: 200,
    });
  }),
];
