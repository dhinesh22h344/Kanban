import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const commentFormSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});
export type CommentFormValues = z.infer<typeof commentFormSchema>;
