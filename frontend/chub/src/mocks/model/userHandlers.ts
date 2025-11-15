import { http, HttpResponse } from "msw";

let is_login = true;

export const userHandlers = [
    http.get(`${import.meta.env.VITE_API_URL}/api/users/me`, async () => {
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
    http.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, async () => {
        return HttpResponse.json({
            success: true,
            status: 200,
            timestamp: new Date().toISOString(),
        });
    }),

    // 사용자 프로필 수정
    http.patch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        async ({ request }) => {
            const body = (await request.json()) as {
                name?: string;
                email?: string;
                bio?: string;
                avatar?: string;
            };

            // 실제로는 서버에서 업데이트하지만, mock에서는 성공 응답만 반환
            return HttpResponse.json({
                success: true,
                status: 200,
                timestamp: new Date().toISOString(),
            });
        }
    ),
];
