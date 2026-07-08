"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopNav scrolled={scrolled} />
        <main
          className="min-w-0 flex-1 overflow-y-auto"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
