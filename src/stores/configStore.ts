import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { ProxmoxServerConfig } from '../types/proxmox'

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
      await invoke('load_server_config')
      set({ hasConfig: true, configLoaded: true })
    } catch (err) {
      set({ hasConfig: false, configLoaded: true })
    }
  },

  saveConfig: async (config) => {
    set({ error: null, success: false })

    try {
      await invoke('save_server_config', { config })
      set({ success: true, hasConfig: true })
      console.log('Configuration saved successfully')
    } catch (err) {
      set({ error: err as string })
      console.error('Error saving configuration:', err)
    }
  },

  setHasConfig: (hasConfig) => set({ hasConfig }),
  clearSuccess: () => set({ success: false }),
  clearError: () => set({ error: null }),
}))
