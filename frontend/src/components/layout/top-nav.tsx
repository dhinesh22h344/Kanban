"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { ProfileMenu } from "@/components/layout/profile-menu"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { cn } from "@/lib/utils"

export function TopNav({ scrolled = false }: { scrolled?: boolean }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Open menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Flowdeck</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-base font-semibold tracking-tight">Flowdeck</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  )
}
