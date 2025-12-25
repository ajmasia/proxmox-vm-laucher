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
  restoreSession: (sessionData: SessionData) => void
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

      // Create session data for transfer
      const sessionData: SessionData = {
        ticket: authResponse.ticket,
        csrfToken: authResponse.csrfToken,
        username: server.username,
        server: {
          id: server.id,
          name: server.name,
          host: server.host,
          port: server.port,
          username: server.username,
        },
        clusterName,
      }

      // Transfer session to main window via IPC
      // This will create the main window and close the login window
      set({ isAuthenticating: false, error: null })
      await window.electronAPI.transferSession(sessionData)
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

  // Restore session from IPC (called in main window)
  restoreSession: (sessionData: SessionData) => {
    const session: ProxmoxSession = {
      ticket: sessionData.ticket,
      csrfToken: sessionData.csrfToken,
      username: sessionData.username,
      server: sessionData.server,
      clusterName: sessionData.clusterName,
    }
    set({ session, error: null })
    const serverInfo = sessionData.clusterName || sessionData.server.host
    toast.success(`Connected to ${serverInfo}`)
  },

  // Logout action
  logout: () => {
    set({ session: null, error: null })
    // Close main window and reopen login window
    window.electronAPI.logout()
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
