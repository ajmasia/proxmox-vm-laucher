import { create } from 'zustand'
import { Store } from '@tauri-apps/plugin-store'
import type { ProxmoxServerConfig } from '../types/proxmox'

interface ServerStore {
  // State
  servers: ProxmoxServerConfig[]
  lastUsedServerId: string | null
  isLoading: boolean

  // Actions
  loadServers: () => Promise<void>
  addServer: (server: Omit<ProxmoxServerConfig, 'id'>) => Promise<void>
  updateServer: (id: string, server: Partial<ProxmoxServerConfig>) => Promise<void>
  deleteServer: (id: string) => Promise<void>
  setLastUsedServer: (id: string) => Promise<void>

  // Helpers
  getServerById: (id: string) => ProxmoxServerConfig | undefined
  getLastUsedServer: () => ProxmoxServerConfig | undefined
}

let store: Store | null = null

const getStore = async () => {
  if (!store) {
    store = await Store.load('servers.json')
  }
  return store
}

export const useServerStore = create<ServerStore>((set, get) => ({
  // Initial state
  servers: [],
  lastUsedServerId: null,
  isLoading: false,

  // Load servers from Tauri Store
  loadServers: async () => {
    set({ isLoading: true })
    try {
      const tauriStore = await getStore()
      const servers = (await tauriStore.get<ProxmoxServerConfig[]>('servers')) || []
      const lastUsedServerId = (await tauriStore.get<string>('lastUsedServerId')) || null

      set({ servers, lastUsedServerId, isLoading: false })
    } catch (error) {
      console.error('Failed to load servers:', error)
      set({ isLoading: false })
    }
  },

  // Add new server
  addServer: async (serverData) => {
    const newServer: ProxmoxServerConfig = {
      ...serverData,
      id: crypto.randomUUID(),
    }

    const servers = [...get().servers, newServer]
    set({ servers })

    // Save to Tauri Store
    const tauriStore = await getStore()
    await tauriStore.set('servers', servers)
    await tauriStore.save()
  },

  // Update existing server
  updateServer: async (id, updates) => {
    const servers = get().servers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    set({ servers })

    // Save to Tauri Store
    const tauriStore = await getStore()
    await tauriStore.set('servers', servers)
    await tauriStore.save()
  },

  // Delete server
  deleteServer: async (id) => {
    const servers = get().servers.filter((s) => s.id !== id)
    const lastUsedServerId = get().lastUsedServerId === id ? null : get().lastUsedServerId

    set({ servers, lastUsedServerId })

    // Save to Tauri Store
    const tauriStore = await getStore()
    await tauriStore.set('servers', servers)
    await tauriStore.set('lastUsedServerId', lastUsedServerId)
    await tauriStore.save()
  },

  // Set last used server
  setLastUsedServer: async (id) => {
    set({ lastUsedServerId: id })

    // Save to Tauri Store
    const tauriStore = await getStore()
    await tauriStore.set('lastUsedServerId', id)
    await tauriStore.save()
  },

  // Get server by ID
  getServerById: (id) => {
    return get().servers.find((s) => s.id === id)
  },

  // Get last used server
  getLastUsedServer: () => {
    const { lastUsedServerId, servers } = get()
    if (!lastUsedServerId) return undefined
    return servers.find((s) => s.id === lastUsedServerId)
  },
}))
