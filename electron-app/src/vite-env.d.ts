/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    closeWindow: () => Promise<void>
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<void>
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
