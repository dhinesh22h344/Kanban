import Link from "next/link"

import { statusChipClassName, statusLabels } from "@/lib/task-display"
import type { TaskSummary } from "@/types/api"

export function TaskList({ tasks, emptyMessage }: { tasks: TaskSummary[]; emptyMessage: string }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="flex flex-col divide-y">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/tasks?taskId=${task.id}`}
            className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-accent/50"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{task.title}</span>
              <span className="text-xs text-muted-foreground">
                {task.taskCode}
                {task.assignedTo ? ` · ${task.assignedTo.name}` : ""}
              </span>
            </div>
            <span className={statusChipClassName[task.status]}>{statusLabels[task.status]}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
