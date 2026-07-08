"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Paperclip, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/api/error"
import { tasksApi } from "@/lib/api/tasks"
import { useAuth } from "@/lib/auth/auth-context"
import { triggerBrowserDownload } from "@/lib/download-file"
import { priorityChipClassName, priorityLabels, statusChipClassName, statusLabels } from "@/lib/task-display"
import { commentFormSchema, type CommentFormValues } from "@/lib/validators/task"
import type { TaskStatus } from "@/types/api"

interface TaskDetailsDrawerProps {
  taskId: number | null
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDeleted: () => void
}

export function TaskDetailsDrawer({ taskId, onOpenChange, onEdit, onDeleted }: TaskDetailsDrawerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getDetail(taskId as number),
    enabled: taskId !== null,
  })

  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { content: "" },
  })

  function refreshTask() {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  const isManager = user?.role === "OWNER" || user?.role === "MANAGER"
  const isAssignee = task?.assignedTo?.id === user?.id
  const canChangeStatus = isManager || isAssignee

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return
    try {
      await tasksApi.updateStatus(task.id, status)
      toast.success("Status updated")
      refreshTask()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update status"))
    }
  }

  async function handleAddComment(values: CommentFormValues) {
    if (!task) return
    try {
      await tasksApi.addComment(task.id, values.content)
      commentForm.reset({ content: "" })
      refreshTask()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add comment"))
    }
  }

  async function handleDelete() {
    if (!task) return
    try {
      await tasksApi.remove(task.id)
      toast.success("Task deleted")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onDeleted()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete task"))
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !task) return
    setIsUploading(true)
    try {
      await tasksApi.uploadAttachment(task.id, file)
      toast.success("Attachment uploaded")
      refreshTask()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload attachment"))
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  async function handleDownload(downloadUrl: string, fileName: string) {
    try {
      const blob = await tasksApi.downloadAttachment(downloadUrl)
      triggerBrowserDownload(blob, fileName)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not download attachment"))
    }
  }

  return (
    <Sheet open={taskId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        {isLoading || !task ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="text-muted-foreground">{task.taskCode}</span>
                {task.title}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={priorityChipClassName[task.priority]}>{priorityLabels[task.priority]}</span>
                {canChangeStatus ? (
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                    <SelectTrigger size="sm" className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={statusChipClassName[task.status]}>{statusLabels[task.status]}</span>
                )}
              </div>

              {task.description && (
                <p className="mt-4 text-sm whitespace-pre-wrap text-foreground">{task.description}</p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Assignee</dt>
                  <dd>{task.assignedTo?.name ?? "Unassigned"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created by</dt>
                  <dd>{task.createdBy.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd>{new Date(task.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>

              {isManager && (
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Attachments</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="size-4" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
                </div>
                {task.attachments.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No attachments yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1">
                    {task.attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <button
                          type="button"
                          onClick={() => handleDownload(attachment.downloadUrl, attachment.fileName)}
                          className="text-sm text-foreground underline-offset-2 hover:underline"
                        >
                          {attachment.fileName}
                        </button>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {(attachment.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-sm font-medium">Comments</h3>
                {task.comments.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-4">
                    {task.comments.map((comment) => (
                      <li key={comment.id} className="text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-foreground">{comment.content}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <Form {...commentForm}>
                  <form
                    onSubmit={commentForm.handleSubmit(handleAddComment)}
                    className="mt-4 flex items-start gap-2"
                  >
                    <FormField
                      control={commentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea rows={2} placeholder="Add a comment..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="icon" aria-label="Send comment">
                      <Send className="size-4" />
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
