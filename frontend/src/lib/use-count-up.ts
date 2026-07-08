"use client"

import * as React from "react"
import { animate } from "framer-motion"

export function useCountUp(target: number, duration = 0.6) {
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (value) => setDisplay(Math.round(value)),
    })
    return () => controls.stop()
  }, [target, duration])

  return display
}
