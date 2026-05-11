import * as React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { AuthProps } from '@/types/auth'
import { authClient } from "@/lib/auth-client";
import { AuthContextTag } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authStore = useAuthStore((state) => state)
  const [user, setUser] = React.useState<AuthProps | null>(authStore.user)

  const [loading, setLoading] = React.useState(true)
  const isAuthenticated = (!!user) && ((user?.token ?? "") !== "");

  const logout = React.useCallback(async () => {
    authStore.logout()
    setUser(null)
  }, [])

  const login = React.useCallback(async (user: AuthProps) => {
    authStore.login(user)
    setUser(user)
  }, [])

  // On initial mount, fetch session
  React.useEffect(() => {
    (async () => {
      try {
        const { data: session } = await authClient.getSession()

        let userData: AuthProps = { token: null, user: null };
        if (session?.user && session?.session?.token) {
          userData = {
            token: session.session.token,
            user: session.user
          }

          authStore.login(userData)
          setUser(userData)
        } else {
          authStore.logout()
          setUser(null)
        }
      } catch (error) {
        authStore.logout()
        setUser(null)
      }

      setLoading(false)
    })()
  }, [])

  if (loading) return null

  return (
    <AuthContextTag.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContextTag.Provider>
  )
}

