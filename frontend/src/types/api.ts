export type Role = "OWNER" | "MANAGER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "DISABLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "TESTING" | "COMPLETED" | "BLOCKED";
export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "COMMENT_ADDED";

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  department: string | null;
  role: Role;
  status: UserStatus;
  companyId: number;
  companyName: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  user: UserSummary;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors: Record<string, string> | null;
}

export interface CommentSummary {
  id: number;
  taskId: number;
  user: UserSummary;
  content: string;
  createdAt: string;
}

export interface AttachmentSummary {
  id: number;
  taskId: number;
  commentId: number | null;
  uploadedBy: UserSummary;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
  createdAt: string;
}

export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  attachmentCount: number;
}

export interface TaskDetail extends TaskSummary {
  description: string | null;
  comments: CommentSummary[];
  attachments: AttachmentSummary[];
}

export interface NotificationSummary {
  id: number;
  type: NotificationType;
  message: string;
  relatedTaskId: number | null;
  relatedTaskCode: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  recentActivity: TaskSummary[];
  todaysAssignedTasks: TaskSummary[];
}
