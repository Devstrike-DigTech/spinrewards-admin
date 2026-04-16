import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminTokens } from '@/types'

interface AuthState {
  tokens: AdminTokens | null
  adminUsername: string | null
  isAuthenticated: boolean
  setAuth: (tokens: AdminTokens, username: string) => void
  setTokens: (tokens: AdminTokens) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      adminUsername: null,
      isAuthenticated: false,

      setAuth: (tokens, username) =>
        set({ tokens, adminUsername: username, isAuthenticated: true }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () =>
        set({ tokens: null, adminUsername: null, isAuthenticated: false }),
    }),
    {
      name: 'spinrewards-admin-auth',
    }
  )
)
