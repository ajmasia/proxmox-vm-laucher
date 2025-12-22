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
