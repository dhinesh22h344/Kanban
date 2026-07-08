"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authApi, type LoginPayload, type RegisterCompanyPayload } from "@/lib/api/auth"
import { tokenStorage } from "@/lib/auth/token-storage"
import type { UserSummary } from "@/types/api"

interface AuthContextValue {
  user: UserSummary | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterCompanyPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const hasToken = tokenStorage.getAccessToken()
      if (hasToken) {
        try {
          const me = await authApi.me()
          if (!cancelled) setUser(me)
        } catch {
          tokenStorage.clear()
          if (!cancelled) setUser(null)
        }
      }
      if (!cancelled) setIsLoading(false)
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = React.useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    tokenStorage.setTokens(response.accessToken, response.refreshToken)
    setUser(response.user)
  }, [])

  const register = React.useCallback(async (payload: RegisterCompanyPayload) => {
    const response = await authApi.register(payload)
    tokenStorage.setTokens(response.accessToken, response.refreshToken)
    setUser(response.user)
  }, [])

  const logout = React.useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } finally {
      tokenStorage.clear()
      setUser(null)
      router.push("/login")
    }
  }, [router])

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
