import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
