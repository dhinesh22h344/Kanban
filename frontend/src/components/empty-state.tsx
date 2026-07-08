import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        compact ? "py-6" : "py-12",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted",
          compact ? "size-8" : "size-12"
        )}
      >
        <Icon className={cn("text-muted-foreground", compact ? "size-4" : "size-6")} />
      </div>
      <div className="flex flex-col gap-1">
        <p className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>{title}</p>
        {description && (
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
