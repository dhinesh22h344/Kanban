"use client"

import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import { notificationsApi } from "@/lib/api/notifications"
import { cn } from "@/lib/utils"
import type { NotificationSummary } from "@/types/api"

const POLL_INTERVAL_MS = 15_000

export function NotificationBell() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: POLL_INTERVAL_MS,
  })

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list().then((page) => page.content),
    refetchInterval: POLL_INTERVAL_MS,
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }

  async function handleSelect(notification: NotificationSummary) {
    if (!notification.isRead) {
      await notificationsApi.markRead(notification.id)
      refresh()
    }
    if (notification.relatedTaskId) {
      router.push(`/tasks?taskId=${notification.relatedTaskId}`)
    }
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead()
    refresh()
  }

  const hasUnread = Boolean(unreadCount && unreadCount > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" variant="ghost" size="icon" aria-label="Notifications" />}
      >
        <span className="relative inline-flex">
          <Bell className="size-4" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1.5 py-1">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications || notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="You're all caught up" compact />
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleSelect(notification)}
              className="flex flex-col items-start gap-0.5 whitespace-normal"
            >
              <div className="flex w-full items-center gap-1.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", !notification.isRead && "bg-primary")} />
                <span className="flex-1 text-sm">{notification.message}</span>
              </div>
              <span className="pl-3 text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
