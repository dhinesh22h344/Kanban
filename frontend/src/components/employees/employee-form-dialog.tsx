"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { employeesApi } from "@/lib/api/employees"
import { getErrorMessage } from "@/lib/api/error"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeFormValues,
  type UpdateEmployeeFormValues,
} from "@/lib/validators/employee"
import type { UserSummary } from "@/types/api"

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: UserSummary | null
  canAssignManager: boolean
  onSaved: () => void
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  canAssignManager,
  onSaved,
}: EmployeeFormDialogProps) {
  const isEdit = Boolean(employee)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const createForm = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", designation: "", department: "", role: "EMPLOYEE" },
  })

  const updateForm = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: { name: "", phone: "", designation: "", department: "", role: "EMPLOYEE" },
  })

  React.useEffect(() => {
    if (open && employee) {
      updateForm.reset({
        name: employee.name,
        phone: employee.phone ?? "",
        designation: employee.designation ?? "",
        department: employee.department ?? "",
        role: employee.role === "OWNER" ? "EMPLOYEE" : employee.role,
      })
    } else if (open && !employee) {
      createForm.reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        designation: "",
        department: "",
        role: "EMPLOYEE",
      })
    }
  }, [open, employee, createForm, updateForm])

  async function onSubmitCreate(values: CreateEmployeeFormValues) {
    setIsSubmitting(true)
    try {
      await employeesApi.create(values)
      toast.success("Employee added")
      onSaved()
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add employee"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onSubmitUpdate(values: UpdateEmployeeFormValues) {
    if (!employee) return
    setIsSubmitting(true)
    try {
      await employeesApi.update(employee.id, values)
      toast.success("Employee updated")
      onSaved()
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update employee"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this person's details." : "Invite a new Manager or Employee to your company."}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="flex flex-col gap-4">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={!canAssignManager}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          {canAssignManager && <SelectItem value="MANAGER">Manager</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="flex flex-col gap-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          {canAssignManager && <SelectItem value="MANAGER">Manager</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add employee"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
