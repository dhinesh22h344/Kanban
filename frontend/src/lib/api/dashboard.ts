import { apiClient } from "@/lib/api/client";
import type { DashboardStats } from "@/types/api";

export const dashboardApi = {
  get: () => apiClient.get<DashboardStats>("/dashboard").then((r) => r.data),
};
