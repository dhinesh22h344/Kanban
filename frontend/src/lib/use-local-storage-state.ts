"use client"

import * as React from "react"

export function useLocalStorageState(key: string, defaultValue: boolean) {
  const [value, setValue] = React.useState(() => {
    if (typeof window === "undefined") return defaultValue
    const stored = window.localStorage.getItem(key)
    return stored === null ? defaultValue : stored === "true"
  })

  const update = React.useCallback(
    (next: boolean) => {
      setValue(next)
      window.localStorage.setItem(key, String(next))
    },
    [key]
  )

  return [value, update] as const
}
