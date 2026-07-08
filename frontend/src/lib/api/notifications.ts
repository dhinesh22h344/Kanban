import { apiClient } from "@/lib/api/client";
import type { NotificationSummary, PageResponse } from "@/types/api";

export const notificationsApi = {
  list: () => apiClient.get<PageResponse<NotificationSummary>>("/notifications", { params: { size: 10 } }).then((r) => r.data),

  unreadCount: () => apiClient.get<number>("/notifications/unread-count").then((r) => r.data),

  markRead: (id: number) => apiClient.post(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => apiClient.post("/notifications/read-all").then((r) => r.data),
};
