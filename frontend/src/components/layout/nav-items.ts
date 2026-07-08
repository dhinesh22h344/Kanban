import { LayoutDashboard, ListChecks, Settings, Users } from "lucide-react";
import type { Role } from "@/types/api";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/employees", label: "Employees", icon: Users, roles: ["OWNER", "MANAGER"] },
  { href: "/settings", label: "Settings", icon: Settings },
];
