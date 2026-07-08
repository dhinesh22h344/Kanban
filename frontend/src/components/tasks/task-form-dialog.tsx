"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { employeesApi } from "@/lib/api/employees"
import { getErrorMessage } from "@/lib/api/error"
import { tasksApi, type CreateTaskPayload } from "@/lib/api/tasks"
import { priorityLabels } from "@/lib/task-display"
import { taskFormSchema, type TaskFormValues } from "@/lib/validators/task"
import type { TaskDetail } from "@/types/api"

const UNASSIGNED = "UNASSIGNED"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskDetail | null
  onSaved: (task: TaskDetail) => void
}

export function TaskFormDialog({ open, onOpenChange, task, onSaved }: TaskFormDialogProps) {
  const isEdit = Boolean(task)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: employees } = useQuery({
    queryKey: ["employees", "assignable"],
    queryFn: () => employeesApi.search({ status: "ACTIVE", size: 100 }),
    enabled: open,
  })

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: UNASSIGNED },
  })

  React.useEffect(() => {
    if (!open) return
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        dueDate: task.dueDate ?? "",
        assignedToId: task.assignedTo ? String(task.assignedTo.id) : UNASSIGNED,
      })
    } else {
      form.reset({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: UNASSIGNED })
    }
  }, [open, task, form])

  async function onSubmit(values: TaskFormValues) {
    const payload: CreateTaskPayload = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      dueDate: values.dueDate || null,
      assignedToId: values.assignedToId === UNASSIGNED ? null : Number(values.assignedToId),
    }

    setIsSubmitting(true)
    try {
      const saved = task ? await tasksApi.update(task.id, payload) : await tasksApi.create(payload)
      toast.success(task ? "Task updated" : "Task created")
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save task"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "Create task"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details, priority, due date, or assignee." : "Add a new task and assign it."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {employees?.content.map((employee) => (
                        <SelectItem key={employee.id} value={String(employee.id)}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
