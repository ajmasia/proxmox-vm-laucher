/// <reference types="vite/client" />

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
