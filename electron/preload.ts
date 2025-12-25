import { contextBridge, ipcRenderer } from 'electron'

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

  // Proxmox API
  authenticate: (config: { host: string, port: number, username: string, password: string }) =>
    ipcRenderer.invoke('proxmox:authenticate', config),

  getClusterName: (config: { host: string, port: number, ticket: string }) =>
    ipcRenderer.invoke('proxmox:getClusterName', config),

  listVMs: (config: { host: string, port: number, ticket: string }) =>
    ipcRenderer.invoke('proxmox:listVMs', config),

  startVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) =>
    ipcRenderer.invoke('proxmox:startVM', config),

  stopVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) =>
    ipcRenderer.invoke('proxmox:stopVM', config),

  suspendVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) =>
    ipcRenderer.invoke('proxmox:suspendVM', config),

  resumeVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) =>
    ipcRenderer.invoke('proxmox:resumeVM', config),

  getTaskStatus: (config: { host: string, port: number, ticket: string, node: string, upid: string }) =>
    ipcRenderer.invoke('proxmox:getTaskStatus', config),

  connectSPICE: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) =>
    ipcRenderer.invoke('proxmox:connectSPICE', config),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
})

// Type declaration for the renderer process
declare global {
  interface Window {
    electronAPI: {
      showWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      isMaximized: () => Promise<boolean>
      onMaximizedChange: (callback: (isMaximized: boolean) => void) => void
      authenticate: (config: { host: string, port: number, username: string, password: string }) => Promise<{ ticket: string, csrfToken: string }>
      getClusterName: (config: { host: string, port: number, ticket: string }) => Promise<string>
      listVMs: (config: { host: string, port: number, ticket: string }) => Promise<any[]>
      startVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => Promise<string>
      stopVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => Promise<string>
      suspendVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => Promise<string>
      resumeVM: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => Promise<string>
      getTaskStatus: (config: { host: string, port: number, ticket: string, node: string, upid: string }) => Promise<any>
      connectSPICE: (config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => Promise<boolean>
      getVersion: () => Promise<string>
      openExternal: (url: string) => Promise<void>
    }
  }
}
