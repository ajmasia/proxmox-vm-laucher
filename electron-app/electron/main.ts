import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// Create HTTPS agent that ignores certificate errors
const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 1200,
    minHeight: 860,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers

// Window controls
ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

// Proxmox API helper using Node.js https module
async function proxmoxRequest(
  method: 'GET' | 'POST',
  host: string,
  port: number,
  urlPath: string,
  ticket?: string,
  csrf?: string,
  body?: Record<string, string>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    if (ticket) {
      headers['Cookie'] = `PVEAuthCookie=${ticket}`
    }
    if (csrf) {
      headers['CSRFPreventionToken'] = csrf
    }

    const bodyData = body ? new URLSearchParams(body).toString() : undefined

    if (bodyData) {
      headers['Content-Length'] = Buffer.byteLength(bodyData).toString()
    }

    const options: https.RequestOptions = {
      hostname: host,
      port: port,
      path: urlPath,
      method: method,
      headers: headers,
      agent: insecureAgent,
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(json.message || `HTTP ${res.statusCode}`))
          } else {
            resolve(json)
          }
        } catch {
          resolve(data)
        }
      })
    })

    req.on('error', reject)

    if (bodyData) {
      req.write(bodyData)
    }
    req.end()
  })
}

// Authentication
ipcMain.handle('proxmox:authenticate', async (_, config: { host: string, port: number, username: string, password: string }) => {
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    '/api2/json/access/ticket',
    undefined,
    undefined,
    { username: config.username, password: config.password }
  )

  if (!response?.data?.ticket) {
    throw new Error(`Authentication failed: ${response?.errors || response?.message || 'Invalid response from server'}`)
  }

  return {
    ticket: response.data.ticket,
    csrfToken: response.data.CSRFPreventionToken
  }
})

// Get cluster name
ipcMain.handle('proxmox:getClusterName', async (_, config: { host: string, port: number, ticket: string }) => {
  const response = await proxmoxRequest(
    'GET',
    config.host,
    config.port,
    '/api2/json/cluster/status',
    config.ticket
  )
  const cluster = response.data?.find((item: any) => item.type === 'cluster')
  return cluster?.name || config.host
})

// List VMs
ipcMain.handle('proxmox:listVMs', async (_, config: { host: string, port: number, ticket: string }) => {
  const response = await proxmoxRequest(
    'GET',
    config.host,
    config.port,
    '/api2/json/cluster/resources?type=vm',
    config.ticket
  )

  // Filter QEMU VMs and enrich with config
  const vms = response.data.filter((vm: any) => vm.type === 'qemu')

  for (const vm of vms) {
    // Normalize tags to empty string if undefined
    vm.tags = vm.tags || ''

    try {
      const configResponse = await proxmoxRequest(
        'GET',
        config.host,
        config.port,
        `/api2/json/nodes/${vm.node}/qemu/${vm.vmid}/config`,
        config.ticket
      )
      vm.spice = configResponse.data?.vga?.toLowerCase().includes('qxl') || false
    } catch {
      vm.spice = false
    }
  }

  return vms
})

// Start VM
ipcMain.handle('proxmox:startVM', async (_, config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => {
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    `/api2/json/nodes/${config.node}/qemu/${config.vmid}/status/start`,
    config.ticket,
    config.csrf
  )
  return response.data
})

// Stop VM
ipcMain.handle('proxmox:stopVM', async (_, config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => {
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    `/api2/json/nodes/${config.node}/qemu/${config.vmid}/status/stop`,
    config.ticket,
    config.csrf
  )
  return response.data
})

// Suspend VM
ipcMain.handle('proxmox:suspendVM', async (_, config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => {
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    `/api2/json/nodes/${config.node}/qemu/${config.vmid}/status/suspend`,
    config.ticket,
    config.csrf
  )
  return response.data
})

// Resume VM
ipcMain.handle('proxmox:resumeVM', async (_, config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => {
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    `/api2/json/nodes/${config.node}/qemu/${config.vmid}/status/resume`,
    config.ticket,
    config.csrf
  )
  return response.data
})

// Get task status
ipcMain.handle('proxmox:getTaskStatus', async (_, config: { host: string, port: number, ticket: string, node: string, upid: string }) => {
  const response = await proxmoxRequest(
    'GET',
    config.host,
    config.port,
    `/api2/json/nodes/${config.node}/tasks/${encodeURIComponent(config.upid)}/status`,
    config.ticket
  )
  return response.data
})

// Connect via SPICE
ipcMain.handle('proxmox:connectSPICE', async (_, config: { host: string, port: number, ticket: string, csrf: string, node: string, vmid: number }) => {
  // Get SPICE config
  const response = await proxmoxRequest(
    'POST',
    config.host,
    config.port,
    `/api2/spiceconfig/nodes/${config.node}/qemu/${config.vmid}/spiceproxy`,
    config.ticket,
    config.csrf,
    { proxy: config.host }
  )

  // Write to temp file
  const tempPath = path.join(app.getPath('temp'), `spice-${config.vmid}.vv`)
  fs.writeFileSync(tempPath, response as string)

  // Launch remote-viewer
  const viewer = spawn('remote-viewer', [tempPath], { detached: true, stdio: 'ignore' })
  viewer.unref()

  return true
})

// App info
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

// Shell
ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url)
})
