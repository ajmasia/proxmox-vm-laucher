import { create } from 'zustand'
import type { ProxmoxServerConfig } from '../types/proxmox'

const STORAGE_KEY = 'pve-launcher-servers'
const LAST_USED_KEY = 'pve-launcher-last-server'

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

const saveToStorage = (servers: ProxmoxServerConfig[], lastUsedServerId: string | null) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
  if (lastUsedServerId) {
    localStorage.setItem(LAST_USED_KEY, lastUsedServerId)
  } else {
    localStorage.removeItem(LAST_USED_KEY)
  }
}

export const useServerStore = create<ServerStore>((set, get) => ({
  // Initial state
  servers: [],
  lastUsedServerId: null,
  isLoading: false,

  // Load servers from localStorage
  loadServers: async () => {
    set({ isLoading: true })
    try {
      const serversJson = localStorage.getItem(STORAGE_KEY)
      const servers = serversJson ? JSON.parse(serversJson) : []
      const lastUsedServerId = localStorage.getItem(LAST_USED_KEY) || null

      set({ servers, lastUsedServerId, isLoading: false })
    } catch (error) {
      console.error('Failed to load servers:', error)
      set({ isLoading: false })
    }
  },

  // Add new server (max 2 servers allowed)
  addServer: async (serverData) => {
    const currentServers = get().servers
    if (currentServers.length >= 2) {
      console.warn('Maximum of 2 servers allowed')
      return
    }

    const newServer: ProxmoxServerConfig = {
      ...serverData,
      id: crypto.randomUUID(),
    }

    const servers = [...currentServers, newServer]
    set({ servers })
    saveToStorage(servers, get().lastUsedServerId)
  },

  // Update existing server
  updateServer: async (id, updates) => {
    const servers = get().servers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    set({ servers })
    saveToStorage(servers, get().lastUsedServerId)
  },

  // Delete server
  deleteServer: async (id) => {
    const servers = get().servers.filter((s) => s.id !== id)
    const lastUsedServerId = get().lastUsedServerId === id ? null : get().lastUsedServerId

    set({ servers, lastUsedServerId })
    saveToStorage(servers, lastUsedServerId)
  },

  // Set last used server
  setLastUsedServer: async (id) => {
    set({ lastUsedServerId: id })
    saveToStorage(get().servers, id)
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
