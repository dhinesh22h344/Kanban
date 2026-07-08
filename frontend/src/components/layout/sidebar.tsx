"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { useLocalStorageState } from "@/lib/use-local-storage-state"

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorageState("flowdeck_sidebar_collapsed", false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden shrink-0 overflow-hidden border-r bg-card md:flex md:flex-col md:gap-6 md:py-4"
    >
      <div className={collapsed ? "flex items-center justify-center px-2" : "flex items-center justify-between px-4"}>
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Flowdeck
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>
      <div className="px-2">
        <SidebarNav collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}
