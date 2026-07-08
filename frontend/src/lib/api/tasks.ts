import { apiClient } from "@/lib/api/client";
import type { CommentSummary, PageResponse, Priority, TaskDetail, TaskStatus, TaskSummary } from "@/types/api";

export interface TaskSearchParams {
  search?: string;
  assignedToId?: number;
  priority?: Priority;
  status?: TaskStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  size?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
  assignedToId?: number | null;
}

export type UpdateTaskPayload = CreateTaskPayload;

export const tasksApi = {
  search: (params: TaskSearchParams) =>
    apiClient.get<PageResponse<TaskSummary>>("/tasks", { params }).then((r) => r.data),

  getDetail: (id: number) => apiClient.get<TaskDetail>(`/tasks/${id}`).then((r) => r.data),

  create: (payload: CreateTaskPayload) => apiClient.post<TaskDetail>("/tasks", payload).then((r) => r.data),

  update: (id: number, payload: UpdateTaskPayload) =>
    apiClient.put<TaskDetail>(`/tasks/${id}`, payload).then((r) => r.data),

  updateStatus: (id: number, status: TaskStatus) =>
    apiClient.patch<TaskDetail>(`/tasks/${id}/status`, { status }).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/tasks/${id}`).then((r) => r.data),

  addComment: (id: number, content: string) =>
    apiClient.post<CommentSummary>(`/tasks/${id}/comments`, { content }).then((r) => r.data),

  // downloadUrl from the API already includes the "/api" prefix that apiClient's
  // baseURL also carries, so strip it here to avoid a duplicated "/api/api/...".
  downloadAttachment: (downloadUrl: string) =>
    apiClient
      .get<Blob>(downloadUrl.replace(/^\/api/, ""), { responseType: "blob" })
      .then((r) => r.data),

  uploadAttachment: (id: number, file: File, commentId?: number) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post(`/tasks/${id}/attachments`, formData, {
        params: commentId ? { commentId } : undefined,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
