import { http, HttpResponse } from "msw";

let is_login = true;

export const userHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/users/me`, async () => {
    if (is_login) {
      return HttpResponse.json({
        success: true,
        status: 200,
        data: {
          id: 0,
          name: "이찬",
          avatar: "/logo.png",
          email: "test@example.com",
          bio: "안녕하세요. 이찬입니다.",
        },
      });
    }
    return HttpResponse.json({
      success: false,
      status: 401,
      data: null,
      errorCode: "UNAUTHORIZED",
      errorMessage: "Unauthorized",
      errorData: "",
    });
  }),
  http.post(`${import.meta.env.VITE_API_URL}/auth/logout`, async () => {
    return HttpResponse.json({
      success: true,
      status: 200,
      timestamp: new Date().toISOString(),
    });
  }),
];
