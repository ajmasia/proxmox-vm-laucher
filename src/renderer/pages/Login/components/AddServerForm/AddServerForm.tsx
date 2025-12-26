import { useState } from 'react'
import { useServerStore } from '../../../../stores/useServerStore'
import type { ProxmoxServerConfig } from '../../../../types/proxmox'

interface AddServerFormProps {
  onCancel: () => void
  onServerAdded: (server: ProxmoxServerConfig) => void
}

const AddServerForm = ({ onCancel, onServerAdded }: AddServerFormProps) => {
  const { addServer } = useServerStore()
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 8006,
    username: 'root@pam',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 8006 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await addServer(formData)
      // Get the added server (it will be the last one)
      const servers = useServerStore.getState().servers
      const addedServer = servers[servers.length - 1]
      onServerAdded(addedServer)
    } catch (error) {
      console.error('Failed to add server:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add New Server
        </h3>
      </div>

      {/* Server Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Server Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500"
          placeholder="Production Server"
        />
      </div>

      {/* Host */}
      <div>
        <label
          htmlFor="host"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Host
        </label>
        <input
          type="text"
          id="host"
          name="host"
          value={formData.host}
          onChange={handleChange}
          required
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500"
          placeholder="192.168.1.100"
        />
      </div>

      {/* Port */}
      <div>
        <label
          htmlFor="port"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Port
        </label>
        <input
          type="number"
          id="port"
          name="port"
          value={formData.port}
          onChange={handleChange}
          required
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500"
        />
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500"
          placeholder="root@pam"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          Add Server
        </button>
      </div>

      <p className="!mb-0 text-xs text-slate-500 dark:text-slate-400">
        Note: Passwords are never stored. You'll need to enter it each time you connect.
      </p>
    </form>
  )
}

export default AddServerForm
