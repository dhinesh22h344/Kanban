"use client"

import { useDroppable } from "@dnd-kit/core"
import { Inbox } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"
import { BoardCard } from "@/components/tasks/board/board-card"
import type { TaskStatus, TaskSummary } from "@/types/api"

export function BoardColumn({
  status,
  label,
  tasks,
  onSelectTask,
}: {
  status: TaskStatus
  label: string
  tasks: TaskSummary[]
  onSelectTask: (task: TaskSummary) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg bg-muted/50 p-2 transition-colors",
          isOver && "bg-accent"
        )}
      >
        {tasks.length === 0 ? (
          <EmptyState icon={Inbox} title="No tasks" compact />
        ) : (
          tasks.map((task, index) => (
            <BoardCard
              key={task.id}
              task={task}
              delay={Math.min(index, 8) * 0.03}
              onSelect={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}
