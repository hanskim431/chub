import { api } from "@/shared/api/api";

interface UserData {
    id: number;
    name: string;
    avatar: string;
    email: string;
    bio: string;
}

interface MeResponse {
    success: boolean;
    status: number;
    data?: UserData;
    errorCode?: string;
    errorMessage?: string;
    errorData?: unknown;
    timestamp?: string;
}

export const getMe = async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>("/api/users/me");
    return response.data;
};

export const postGuestLogin = async () => {
    try {
        const response = await api.post("/api/login/guest");
        return response.data;
    } catch (error) {
        console.warn("postGuestLogin API 호출 실패:", error);
        return null;
    }
};

export const postLogout = async () => {
    try {
        const response = await api.post("/auth/logout");
        return response.data;
    } catch (error) {
        console.warn("postLogout API 호출 실패:", error);
        return null;
    }
};

export interface UpdateUserProfileRequest {
    name?: string;
    email?: string;
    bio?: string;
    avatar?: string;
}

export const updateUserProfile = async (
    data: UpdateUserProfileRequest
): Promise<MeResponse> => {
    const response = await api.patch<MeResponse>("/api/users/me", data);
    return response.data;
};