import { useState } from 'react'
import type { ProxmoxServerConfig } from '../types/proxmox'

interface ServerConfigProps {
  onSave: (config: ProxmoxServerConfig) => void
  initialConfig?: ProxmoxServerConfig
}

export default function ServerConfig({ onSave, initialConfig }: ServerConfigProps) {
  const [config, setConfig] = useState<ProxmoxServerConfig>(
    initialConfig || {
      host: '',
      port: 8006,
      username: 'root@pam',
      password: '',
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 8006 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(config)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Proxmox Server Configuration
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Enter your Proxmox server credentials. This information will be stored securely.
        </p>
      </div>

      <div>
        <label htmlFor="host" className="block text-sm font-medium text-slate-700">
          Proxmox Host
        </label>
        <input
          type="text"
          id="host"
          name="host"
          value={config.host}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="192.168.1.100"
        />
      </div>

      <div>
        <label htmlFor="port" className="block text-sm font-medium text-slate-700">
          Port
        </label>
        <input
          type="number"
          id="port"
          name="port"
          value={config.port}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={config.username}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="root@pam"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={config.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Configuration
      </button>
    </form>
  )
}
