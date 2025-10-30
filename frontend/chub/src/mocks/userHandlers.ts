import { http, HttpResponse } from "msw";

let is_login = true;

export const userHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/users/me`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (is_login) {
      return HttpResponse.json({
        success: true,
        status: 0,
        data: {
          id: 0,
          name: "이찬",
          avatar: "/logo.png",
        },
      });
    }
    return HttpResponse.json({
      success: false,
      status: 0,
      data: null,
      errorCode: "UNAUTHORIZED",
      errorMessage: "Unauthorized",
      errorData: "",
    });
  }),
  http.post(`${import.meta.env.VITE_API_URL}/auth/logout`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    is_login = false;
    return HttpResponse.json({
      success: true,
      status: 200,
      timestamp: new Date().toISOString(),
    });
  }),
];
