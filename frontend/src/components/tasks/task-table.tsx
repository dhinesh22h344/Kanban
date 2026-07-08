"use client"

import { ListChecks } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { priorityChipClassName, priorityLabels, statusChipClassName, statusLabels } from "@/lib/task-display"
import type { TaskSummary } from "@/types/api"

export function TaskTable({ tasks, onSelect }: { tasks: TaskSummary[]; onSelect: (task: TaskSummary) => void }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks found"
        description="Try adjusting your search or filters, or create a new task."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="cursor-pointer" onClick={() => onSelect(task)}>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{task.title}</span>
                <span className="text-xs text-muted-foreground">{task.taskCode}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{task.assignedTo?.name ?? "Unassigned"}</TableCell>
            <TableCell>
              <span className={priorityChipClassName[task.priority]}>{priorityLabels[task.priority]}</span>
            </TableCell>
            <TableCell>
              <span className={statusChipClassName[task.status]}>{statusLabels[task.status]}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
