import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/index'

type CheckState = 'checking' | 'ok' | 'fail'

export function PrivateRoute() {
  const { isAuthenticated, tokens, setAuth, clearAuth } = useAuthStore()
  const [state, setState] = useState<CheckState>(isAuthenticated ? 'checking' : 'fail')

  useEffect(() => {
    // If not authenticated at all, skip the /me/ call
    if (!isAuthenticated || !tokens?.access_token) {
      setState('fail')
      return
    }

    // Validate the stored token against the backend
    authApi.me()
      .then((user) => {
        // Refresh admin user info in case display_name or roles changed
        setAuth(tokens, user)
        setState('ok')
      })
      .catch(() => {
        clearAuth()
        setState('fail')
      })
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07090F]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-[#1e2a4a]"
            style={{ borderTopColor: '#C9961A' }}
          />
          <p className="text-sm text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    )
  }

  if (state === 'fail') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
