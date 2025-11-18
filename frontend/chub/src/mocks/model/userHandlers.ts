import { http, HttpResponse } from "msw";

let is_login = true;
let userData = {
  id: 1,
  name: "이찬",
  avatar: "/logo.png",
  email: "test@example.com",
  bio: "안녕하세요. 이찬입니다.",
};

export const userHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/api/users/me`, async () => {
    if (is_login) {
      return HttpResponse.json({
        success: true,
        status: 200,
        data: userData,
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
  http.patch(
    `${import.meta.env.VITE_API_URL}/api/users/me`,
    async ({ request }) => {
      if (!is_login) {
        return HttpResponse.json(
          {
            success: false,
            status: 401,
            errorCode: "UNAUTHORIZED",
            errorMessage: "Unauthorized",
          },
          { status: 401 }
        );
      }

      const body = (await request.json()) as Partial<typeof userData>;
      userData = { ...userData, ...body };

      return HttpResponse.json({
        success: true,
        status: 200,
        data: userData,
        timestamp: new Date().toISOString(),
      });
    }
  ),
  http.post(`${import.meta.env.VITE_API_URL}/auth/logout`, async () => {
    return HttpResponse.json({
      success: true,
      status: 200,
      timestamp: new Date().toISOString(),
    });
  }),
];
