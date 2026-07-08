"use client"

import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, CircleDot, ClipboardList, ListTodo, TriangleAlert } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { TaskList } from "@/components/dashboard/task-list"
import { dashboardApi } from "@/lib/api/dashboard"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your tasks.</p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total tasks" value={data.totalTasks} icon={ClipboardList} />
          <StatCard label="Pending" value={data.pendingTasks} icon={ListTodo} />
          <StatCard label="In progress" value={data.inProgressTasks} icon={CircleDot} />
          <StatCard label="Completed" value={data.completedTasks} icon={CheckCircle2} />
          <StatCard label="Overdue" value={data.overdueTasks} icon={TriangleAlert} tone="critical" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s assigned tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-32" />
            ) : (
              <TaskList tasks={data.todaysAssignedTasks} emptyMessage="Nothing due today." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-32" />
            ) : (
              <TaskList tasks={data.recentActivity} emptyMessage="No recent activity yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
