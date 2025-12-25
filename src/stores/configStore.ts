import { create } from 'zustand'
import type { ProxmoxServerConfig } from '../types/proxmox'

const STORAGE_KEY = 'pve-launcher-servers'

interface ConfigStore {
  // State
  hasConfig: boolean
  configLoaded: boolean
  success: boolean
  error: string | null

  // Actions
  checkConfig: () => Promise<void>
  saveConfig: (config: ProxmoxServerConfig) => Promise<void>
  setHasConfig: (hasConfig: boolean) => void
  clearSuccess: () => void
  clearError: () => void
}

export const useConfigStore = create<ConfigStore>((set) => ({
  // Initial state
  hasConfig: false,
  configLoaded: false,
  success: false,
  error: null,

  // Actions
  checkConfig: async () => {
    try {
      const serversJson = localStorage.getItem(STORAGE_KEY)
      const servers = serversJson ? JSON.parse(serversJson) : []
      set({ hasConfig: servers.length > 0, configLoaded: true })
    } catch {
      set({ hasConfig: false, configLoaded: true })
    }
  },

  saveConfig: async (config) => {
    set({ error: null, success: false })

    try {
      const serversJson = localStorage.getItem(STORAGE_KEY)
      const servers = serversJson ? JSON.parse(serversJson) : []

      const newServer = {
        ...config,
        id: config.id || crypto.randomUUID(),
      }

      servers.push(newServer)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))

      set({ success: true, hasConfig: true })
      console.log('Configuration saved successfully')
    } catch (err) {
      set({ error: String(err) })
      console.error('Error saving configuration:', err)
    }
  },

  setHasConfig: (hasConfig) => set({ hasConfig }),
  clearSuccess: () => set({ success: false }),
  clearError: () => set({ error: null }),
}))
