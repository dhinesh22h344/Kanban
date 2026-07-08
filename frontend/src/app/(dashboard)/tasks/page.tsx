"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, List, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Board } from "@/components/tasks/board/board"
import { TaskDetailsDrawer } from "@/components/tasks/task-details-drawer"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"
import { TaskTable } from "@/components/tasks/task-table"
import { employeesApi } from "@/lib/api/employees"
import { tasksApi } from "@/lib/api/tasks"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { priorityLabels, statusLabels } from "@/lib/task-display"
import type { Priority, TaskDetail, TaskStatus, TaskSummary } from "@/types/api"

type ViewMode = "board" | "table"

function TasksPageContent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState("")
  const [priorityFilter, setPriorityFilter] = React.useState<Priority | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "ALL">("ALL")
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("ALL")
  const [page, setPage] = React.useState(0)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<TaskDetail | null>(null)

  const view: ViewMode = searchParams.get("view") === "table" ? "table" : "board"
  const selectedTaskId = searchParams.get("taskId") ? Number(searchParams.get("taskId")) : null

  const isManager = user?.role === "OWNER" || user?.role === "MANAGER"

  function setView(next: ViewMode) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "board") {
      params.delete("view")
    } else {
      params.set("view", next)
    }
    router.push(params.toString() ? `/tasks?${params.toString()}` : "/tasks")
  }

  const { data: employees } = useQuery({
    queryKey: ["employees", "assignable"],
    queryFn: () => employeesApi.search({ status: "ACTIVE", size: 100 }),
    enabled: isManager && view === "board",
  })

  const tableQueryKey = ["tasks", "table", { search, priorityFilter, statusFilter, page }]
  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: tableQueryKey,
    queryFn: () =>
      tasksApi.search({
        search: search || undefined,
        priority: priorityFilter === "ALL" ? undefined : priorityFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
    enabled: view === "table",
  })

  const boardQueryKey = ["tasks", "board", { search, assigneeFilter }]
  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: boardQueryKey,
    queryFn: () =>
      tasksApi.search({
        search: search || undefined,
        assignedToId: assigneeFilter === "ALL" ? undefined : Number(assigneeFilter),
        size: 100,
      }),
    enabled: view === "board",
  })

  function openTask(taskId: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("taskId", String(taskId))
    router.push(`/tasks?${params.toString()}`)
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("taskId")
    router.push(params.toString() ? `/tasks?${params.toString()}` : "/tasks")
  }

  function refreshList() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  function selectTaskFromBoard(task: TaskSummary) {
    openTask(task.id)
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isManager ? "All tasks across your company." : "Tasks assigned to you."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "board" ? "secondary" : "ghost"}
              className="gap-1.5"
              onClick={() => setView("board")}
            >
              <LayoutGrid className="size-4" />
              Board
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              className="gap-1.5"
              onClick={() => setView("table")}
            >
              <List className="size-4" />
              Table
            </Button>
          </div>
          {isManager && (
            <Button
              type="button"
              onClick={() => {
                setEditingTask(null)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Create task
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by task ID or title"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setPage(0)
              setSearch(e.target.value)
            }}
          />
        </div>

        {view === "table" ? (
          <>
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPage(0)
                setPriorityFilter(value as Priority | "ALL")
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priorities</SelectItem>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setPage(0)
                setStatusFilter(value as TaskStatus | "ALL")
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          isManager && (
            <Select value={assigneeFilter} onValueChange={(value) => setAssigneeFilter(value ?? "ALL")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Everyone</SelectItem>
                {employees?.content.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        )}
      </div>

      {view === "board" ? (
        boardLoading || !boardData ? (
          <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5")}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <Board tasks={boardData.content} queryKey={boardQueryKey} onSelectTask={selectTaskFromBoard} />
        )
      ) : tableLoading || !tableData ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <TaskTable tasks={tableData.content} onSelect={(task) => openTask(task.id)} />

          {tableData.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {tableData.page + 1} of {tableData.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={tableData.page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={tableData.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSaved={() => {
          refreshList()
          queryClient.invalidateQueries({ queryKey: ["task"] })
        }}
      />

      <TaskDetailsDrawer
        taskId={selectedTaskId}
        onOpenChange={(open) => !open && closeDrawer()}
        onEdit={() => {
          if (!selectedTaskId) return
          tasksApi.getDetail(selectedTaskId).then((task) => {
            setEditingTask(task)
            setFormOpen(true)
          })
        }}
        onDeleted={closeDrawer}
      />
    </div>
  )
}

export default function TasksPage() {
  return (
    <React.Suspense fallback={null}>
      <TasksPageContent />
    </React.Suspense>
  )
}
