import { create } from 'zustand'
import { toast } from 'sonner'
import type { ProxmoxSession, ProxmoxServerConfig } from '../types/proxmox'

interface AuthStore {
  // State
  session: ProxmoxSession | null
  isAuthenticating: boolean
  error: string | null

  // Actions
  login: (server: ProxmoxServerConfig, password: string) => Promise<void>
  logout: () => void
  clearError: () => void

  // Helpers
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  session: null,
  isAuthenticating: false,
  error: null,

  // Login action
  login: async (server: ProxmoxServerConfig, password: string) => {
    set({ isAuthenticating: true, error: null })

    try {
      // Call backend to authenticate
      const authResponse = await window.electronAPI.authenticate({
        host: server.host,
        port: server.port,
        username: server.username,
        password,
      })

      // Try to get cluster name (optional, don't fail if it doesn't work)
      let clusterName: string | undefined
      try {
        clusterName = await window.electronAPI.getClusterName({
          host: server.host,
          port: server.port,
          ticket: authResponse.ticket,
        })
      } catch {
        // Ignore cluster name errors
        clusterName = undefined
      }

      // Create session
      const session: ProxmoxSession = {
        ticket: authResponse.ticket,
        csrfToken: authResponse.csrfToken,
        username: server.username,
        server,
        clusterName,
      }

      set({ session, isAuthenticating: false, error: null })

      const serverInfo = clusterName || server.host
      toast.success(`Connected to ${serverInfo}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      set({
        session: null,
        isAuthenticating: false,
        error: message,
      })
      toast.error(message)
      throw error
    }
  },

  // Logout action
  logout: () => {
    set({ session: null, error: null })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Check if authenticated
  isAuthenticated: () => {
    return get().session !== null
  },
}))
