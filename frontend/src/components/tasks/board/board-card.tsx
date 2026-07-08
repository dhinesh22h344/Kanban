"use client"

import { useDraggable } from "@dnd-kit/core"
import { motion } from "framer-motion"
import { MessageSquare, Paperclip } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { priorityChipClassName, priorityLabels } from "@/lib/task-display"
import type { TaskSummary } from "@/types/api"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function BoardCard({
  task,
  onSelect,
  delay = 0,
}: {
  task: TaskSummary
  onSelect: () => void
  delay?: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, delay }}
      className={cn(
        "flex cursor-grab flex-col gap-2 rounded-md border bg-card p-4 text-sm transition-colors hover:border-foreground/20 active:cursor-grabbing"
      )}
    >
      <span className="font-medium text-foreground">{task.title}</span>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{task.taskCode}</span>
        <span className={priorityChipClassName[task.priority]}>{priorityLabels[task.priority]}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {task.commentCount}
            </span>
          )}
          {task.attachmentCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="size-3.5" />
              {task.attachmentCount}
            </span>
          )}
        </div>
        {task.assignedTo && (
          <Avatar size="sm">
            <AvatarFallback>{initials(task.assignedTo.name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.div>
  )
}
