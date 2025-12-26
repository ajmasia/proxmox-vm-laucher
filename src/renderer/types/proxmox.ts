// Server configuration (stored securely - NO password)
export interface ProxmoxServerConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
}

// Session data (in memory only)
export interface ProxmoxSession {
  ticket: string
  csrfToken: string
  username: string
  server: ProxmoxServerConfig
  clusterName?: string
}

// VM information from Proxmox API
export interface ProxmoxVM {
  vmid: number
  name: string
  status: 'running' | 'stopped' | 'paused'
  node: string
  uptime?: number
  cpus?: number
  maxmem?: number
  mem?: number
  maxdisk?: number
  disk?: number
  tags?: string
  spice?: boolean
  ipAddress?: string
}

// Legacy - for backward compatibility
export interface ProxmoxConnection {
  id?: string
  name: string
  host: string
  port: number
  username: string
  password?: string
  node: string
  vmid: string
}

export interface ProxmoxAuthResponse {
  ticket: string
  csrfToken: string
}

export interface VMStatus {
  status: 'running' | 'stopped' | 'paused'
  name: string
  uptime?: number
  cpus?: number
  memory?: number
}

export interface SpiceConfig {
  host: string
  port: number
  password: string
  tlsPort?: number
  type: 'spice'
}
