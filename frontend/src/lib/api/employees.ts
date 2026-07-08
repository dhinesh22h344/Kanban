import { apiClient } from "@/lib/api/client";
import type { PageResponse, Role, UserStatus, UserSummary } from "@/types/api";

export interface EmployeeSearchParams {
  search?: string;
  role?: Role;
  status?: UserStatus;
  department?: string;
  page?: number;
  size?: number;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  designation?: string;
  department?: string;
  role: Role;
}

export interface UpdateEmployeePayload {
  name: string;
  phone?: string;
  designation?: string;
  department?: string;
  role?: Role;
}

export const employeesApi = {
  search: (params: EmployeeSearchParams) =>
    apiClient.get<PageResponse<UserSummary>>("/employees", { params }).then((r) => r.data),

  create: (payload: CreateEmployeePayload) =>
    apiClient.post<UserSummary>("/employees", payload).then((r) => r.data),

  update: (id: number, payload: UpdateEmployeePayload) =>
    apiClient.put<UserSummary>(`/employees/${id}`, payload).then((r) => r.data),

  updateStatus: (id: number, status: UserStatus) =>
    apiClient.patch<UserSummary>(`/employees/${id}/status`, { status }).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/employees/${id}`).then((r) => r.data),
};
