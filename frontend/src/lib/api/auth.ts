import { apiClient } from "@/lib/api/client";
import type { AuthResponse, UserSummary } from "@/types/api";

export interface RegisterCompanyPayload {
  companyName: string;
  ownerName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (payload: RegisterCompanyPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }).then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post("/auth/forgot-password", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post("/auth/reset-password", payload).then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post("/auth/change-password", payload).then((r) => r.data),

  me: () => apiClient.get<UserSummary>("/auth/me").then((r) => r.data),
};
