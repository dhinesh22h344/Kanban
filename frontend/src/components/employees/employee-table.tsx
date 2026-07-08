"use client"

import { MoreHorizontal, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/empty-state"
import type { UserSummary } from "@/types/api"

interface EmployeeTableProps {
  employees: UserSummary[]
  currentUserId: number
  onEdit: (employee: UserSummary) => void
  onToggleStatus: (employee: UserSummary) => void
  onDelete: (employee: UserSummary) => void
}

export function EmployeeTable({ employees, currentUserId, onEdit, onToggleStatus, onDelete }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No employees found"
        description="Try adjusting your search, or add your first employee."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const isSelf = employee.id === currentUserId
          const isOwner = employee.role === "OWNER"
          const canManage = !isSelf && !isOwner

          return (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell className="text-muted-foreground">{employee.email}</TableCell>
              <TableCell>{employee.designation ?? "—"}</TableCell>
              <TableCell>{employee.department ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {employee.role.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={employee.status === "ACTIVE" ? "secondary" : "destructive"}>
                  {employee.status === "ACTIVE" ? "Active" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button type="button" variant="ghost" size="icon" aria-label="Employee actions" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(employee)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(employee)}>
                        {employee.status === "ACTIVE" ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(employee)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
