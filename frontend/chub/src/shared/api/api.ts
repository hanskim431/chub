import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res: AxiosResponse<T> = await api.get(url, config);
  return res.data;
};

export const post = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res: AxiosResponse<T> = await api.post(url, body, config);
  return res.data;
};

export const put = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res: AxiosResponse<T> = await api.put(url, body, config);
  return res.data;
};

export const patch = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res: AxiosResponse<T> = await api.patch(url, body, config);
  return res.data;
};

export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res: AxiosResponse<T> = await api.delete(url, config);
  return res.data;
};

export const audioApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

interface AudioPostRequest {
  url: string;
  roomId: string;
  audioFile: Blob;
}

export const audioPost = async ({
  url,
  roomId,
  audioFile,
}: AudioPostRequest) => {
  const formData = new FormData();
  formData.append("roomId", roomId);
  formData.append("audioFile", audioFile, "answer.webm");
  const res = await audioApi.post(url, formData);
  return res.data;
};
