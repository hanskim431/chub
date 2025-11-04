import { api } from "@/shared/api/api";

export const getRecruiters = async () => {
  try {
    const response = await api.get("/api/profiles/interviewers");
    return response.data;
  } catch (error) {
    console.warn("getRecruiters API 호출 실패:", error);
    return null;
  }
};

export const getMyRecruiterDetail = async (id: string) => {
  try {
    const response = await api.get(
      `${import.meta.env.VITE_API_URL}/api/profiles/interviewers/:id`,
      { params: { id } }
    );
    return response.data;
  } catch (error) {
    console.warn("getMyRecruiterDetail API 호출 실패:", error);
    return null;
  }
};
