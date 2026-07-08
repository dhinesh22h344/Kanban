"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog"
import { EmployeeTable } from "@/components/employees/employee-table"
import { employeesApi } from "@/lib/api/employees"
import { getErrorMessage } from "@/lib/api/error"
import { useAuth } from "@/lib/auth/auth-context"
import type { Role, UserSummary } from "@/types/api"

export default function EmployeesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<Role | "ALL">("ALL")
  const [page, setPage] = React.useState(0)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<UserSummary | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<UserSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<UserSummary | null>(null)

  const canManageEmployees = user?.role === "OWNER" || user?.role === "MANAGER"

  const { data, isLoading } = useQuery({
    queryKey: ["employees", { search, roleFilter, page }],
    queryFn: () =>
      employeesApi.search({
        search: search || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        page,
        size: 20,
      }),
    enabled: canManageEmployees,
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["employees"] })
  }

  async function handleToggleStatus() {
    if (!statusTarget) return
    const nextStatus = statusTarget.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    try {
      await employeesApi.updateStatus(statusTarget.id, nextStatus)
      toast.success(nextStatus === "ACTIVE" ? "Employee enabled" : "Employee disabled")
      refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update status"))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await employeesApi.remove(deleteTarget.id)
      toast.success("Employee deleted")
      refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete employee"))
    }
  }

  if (!user) return null

  if (!canManageEmployees) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Only Owners and Managers can manage employees.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage the people in your company.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingEmployee(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add employee
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setPage(0)
              setSearch(e.target.value)
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setPage(0)
            setRoleFilter(value as Role | "ALL")
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading || !data ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={data.content}
            currentUserId={user.id}
            onEdit={(employee) => {
              setEditingEmployee(employee)
              setFormOpen(true)
            }}
            onToggleStatus={setStatusTarget}
            onDelete={setDeleteTarget}
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.page + 1} of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data.page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        canAssignManager={user.role === "OWNER"}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.status === "ACTIVE" ? "Disable employee?" : "Enable employee?"}
        description={
          statusTarget?.status === "ACTIVE"
            ? `${statusTarget?.name} will no longer be able to sign in.`
            : `${statusTarget?.name} will be able to sign in again.`
        }
        confirmLabel={statusTarget?.status === "ACTIVE" ? "Disable" : "Enable"}
        destructive={statusTarget?.status === "ACTIVE"}
        onConfirm={handleToggleStatus}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete employee?"
        description={`This permanently removes ${deleteTarget?.name}. Employees with task history can't be deleted — disable them instead.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
