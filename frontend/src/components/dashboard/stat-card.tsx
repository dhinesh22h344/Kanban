"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/lib/use-count-up"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number
  icon: LucideIcon
  tone?: "default" | "critical"
}) {
  const displayValue = useCountUp(value)

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                tone === "critical" && value > 0 && "text-destructive"
              )}
            >
              {displayValue.toLocaleString()}
            </span>
          </div>
          <Icon
            className={cn(
              "size-8 text-muted-foreground",
              tone === "critical" && value > 0 && "text-destructive"
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
