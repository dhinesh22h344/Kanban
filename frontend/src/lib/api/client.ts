import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { AuthResponse } from "@/types/api";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<AuthResponse>(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken }
  );

  tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/register");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retried || isAuthEndpoint) {
      throw error;
    }

    originalRequest._retried = true;

    try {
      refreshPromise ??= refreshAccessToken();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw refreshError;
    }
  }
);
