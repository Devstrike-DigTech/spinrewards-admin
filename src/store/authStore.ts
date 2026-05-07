import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminTokens, AdminAccount } from '@/types'

interface AuthState {
  tokens: AdminTokens | null
  adminUser: AdminAccount | null
  isAuthenticated: boolean
  setAuth: (tokens: AdminTokens, user: AdminAccount) => void
  setTokens: (tokens: AdminTokens) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      adminUser: null,
      isAuthenticated: false,

      setAuth: (tokens, user) =>
        set({ tokens, adminUser: user, isAuthenticated: true }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () =>
        set({ tokens: null, adminUser: null, isAuthenticated: false }),
    }),
    { name: 'spinrewards-admin-auth' }
  )
)
