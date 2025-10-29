import { api } from "@/shared/api/api";

export const getMe = async () => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    console.warn("getMe API 호출 실패:", error);
    return null;
  }
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
