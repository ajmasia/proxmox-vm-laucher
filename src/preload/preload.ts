import { contextBridge, ipcRenderer } from 'electron'

// Session data type for handoff between windows
interface SessionData {
  ticket: string
  csrfToken: string
  username: string
  server: {
    id: string
    name: string
    host: string
    port: number
    username: string
  }
  clusterName?: string
}

// VM type for API responses
interface VMResource {
  vmid: number
  name: string
  status: 'running' | 'stopped' | 'paused'
  node: string
  tags?: string
  spice?: boolean
}

// Task status type
interface TaskStatus {
  status: 'running' | 'stopped'
  exitstatus?: string
}

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  showWindow: () => ipcRenderer.invoke('window:show'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window:maximized-change', (_, isMaximized) => callback(isMaximized))
  },

  // Window type detection
  getWindowType: () => ipcRenderer.invoke('window:getType'),

  // Add server window
  openAddServerWindow: () => ipcRenderer.invoke('window:openAddServer'),

  // Session management
  transferSession: (session: SessionData) => ipcRenderer.invoke('session:transfer', session),
  requestSession: () => ipcRenderer.invoke('session:request'),
  logout: () => ipcRenderer.invoke('session:logout'),
  onSessionReceive: (callback: (session: SessionData) => void) => {
    ipcRenderer.on('session:receive', (_, session) => callback(session))
  },
  removeSessionListener: () => {
    ipcRenderer.removeAllListeners('session:receive')
  },

  // Proxmox API
  authenticate: (config: { host: string; port: number; username: string; password: string }) =>
    ipcRenderer.invoke('proxmox:authenticate', config),

  getClusterName: (config: { host: string; port: number; ticket: string }) =>
    ipcRenderer.invoke('proxmox:getClusterName', config),

  listVMs: (config: { host: string; port: number; ticket: string }) =>
    ipcRenderer.invoke('proxmox:listVMs', config),

  startVM: (config: {
    host: string
    port: number
    ticket: string
    csrf: string
    node: string
    vmid: number
  }) => ipcRenderer.invoke('proxmox:startVM', config),

  stopVM: (config: {
    host: string
    port: number
    ticket: string
    csrf: string
    node: string
    vmid: number
  }) => ipcRenderer.invoke('proxmox:stopVM', config),

  suspendVM: (config: {
    host: string
    port: number
    ticket: string
    csrf: string
    node: string
    vmid: number
  }) => ipcRenderer.invoke('proxmox:suspendVM', config),

  resumeVM: (config: {
    host: string
    port: number
    ticket: string
    csrf: string
    node: string
    vmid: number
  }) => ipcRenderer.invoke('proxmox:resumeVM', config),

  getTaskStatus: (config: {
    host: string
    port: number
    ticket: string
    node: string
    upid: string
  }) => ipcRenderer.invoke('proxmox:getTaskStatus', config),

  connectSPICE: (config: {
    host: string
    port: number
    ticket: string
    csrf: string
    node: string
    vmid: number
  }) => ipcRenderer.invoke('proxmox:connectSPICE', config),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
})

// Type declaration for the renderer process
declare global {
  interface Window {
    electronAPI: {
      // Window controls
      showWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      isMaximized: () => Promise<boolean>
      onMaximizedChange: (callback: (isMaximized: boolean) => void) => void

      // Window type detection
      getWindowType: () => Promise<'login' | 'addServer' | 'main' | 'unknown'>

      // Add server window
      openAddServerWindow: () => Promise<void>

      // Session management
      transferSession: (session: SessionData) => Promise<void>
      requestSession: () => Promise<SessionData | null>
      logout: () => Promise<void>
      onSessionReceive: (callback: (session: SessionData) => void) => void
      removeSessionListener: () => void

      // Proxmox API
      authenticate: (config: {
        host: string
        port: number
        username: string
        password: string
      }) => Promise<{ ticket: string; csrfToken: string }>
      getClusterName: (config: { host: string; port: number; ticket: string }) => Promise<string>
      listVMs: (config: { host: string; port: number; ticket: string }) => Promise<VMResource[]>
      startVM: (config: {
        host: string
        port: number
        ticket: string
        csrf: string
        node: string
        vmid: number
      }) => Promise<string>
      stopVM: (config: {
        host: string
        port: number
        ticket: string
        csrf: string
        node: string
        vmid: number
      }) => Promise<string>
      suspendVM: (config: {
        host: string
        port: number
        ticket: string
        csrf: string
        node: string
        vmid: number
      }) => Promise<string>
      resumeVM: (config: {
        host: string
        port: number
        ticket: string
        csrf: string
        node: string
        vmid: number
      }) => Promise<string>
      getTaskStatus: (config: {
        host: string
        port: number
        ticket: string
        node: string
        upid: string
      }) => Promise<TaskStatus>
      connectSPICE: (config: {
        host: string
        port: number
        ticket: string
        csrf: string
        node: string
        vmid: number
      }) => Promise<boolean>

      // App info
      getVersion: () => Promise<string>

      // Shell
      openExternal: (url: string) => Promise<void>
    }
  }
}
