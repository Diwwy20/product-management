import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const authUrls = ["/auth/refresh-token", "/auth/logout"];
    const isAuthRequest = authUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (error.response?.status === 401) {
      if (isAuthRequest || originalRequest._retry) {
        authStore.clearAuth();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        await authStore.refresh();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        authStore.clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
