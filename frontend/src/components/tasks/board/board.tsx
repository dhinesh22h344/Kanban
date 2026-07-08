"use client"

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import { toast } from "sonner"

import { BoardColumn } from "@/components/tasks/board/board-column"
import { tasksApi } from "@/lib/api/tasks"
import { getErrorMessage } from "@/lib/api/error"
import { statusLabels } from "@/lib/task-display"
import type { PageResponse, TaskStatus, TaskSummary } from "@/types/api"

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "TESTING", "COMPLETED", "BLOCKED"]

export function Board({
  tasks,
  queryKey,
  onSelectTask,
}: {
  tasks: TaskSummary[]
  queryKey: QueryKey
  onSelectTask: (task: TaskSummary) => void
}) {
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = Number(active.id)
    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    queryClient.setQueryData<PageResponse<TaskSummary>>(queryKey, (old) =>
      old
        ? { ...old, content: old.content.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)) }
        : old
    )

    try {
      await tasksApi.updateStatus(taskId, newStatus)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update task status"))
    } finally {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            label={statusLabels[status]}
            tasks={tasks.filter((t) => t.status === status)}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </DndContext>
  )
}
