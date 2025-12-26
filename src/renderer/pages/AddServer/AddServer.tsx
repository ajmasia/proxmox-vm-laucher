import { useState, useEffect } from 'react'
import { useServerStore } from '../../stores/useServerStore'
import { ServerForm } from './components/ServerForm/ServerForm'

export const AddServer = () => {
  const { addServer, loadServers } = useServerStore()

  // Load existing servers before adding new ones
  useEffect(() => {
    loadServers()
  }, [loadServers])

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
      // Close the window - server is saved to localStorage and will be available in login window
      window.electronAPI.closeWindow()
    } catch (error) {
      console.error('Failed to add server:', error)
    }
  }

  const handleCancel = () => {
    window.electronAPI.closeWindow()
  }

  return (
    <div className="relative flex h-screen flex-col bg-ctp-base">
      {/* Draggable region for moving window */}
      <div
        className="absolute inset-x-0 top-0 h-10"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      {/* Form container - takes full height */}
      <div className="flex flex-1 flex-col p-6 pt-12">
        <h1 className="mb-6 text-xl font-bold text-ctp-text">Add New Server</h1>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
          <ServerForm formData={formData} onChange={handleChange} />

          {/* Footer - always at bottom */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg border-2 border-ctp-surface1 bg-ctp-mantle px-4 py-2.5 text-sm font-medium text-ctp-subtext1 transition-colors hover:bg-ctp-surface0 focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-ctp-mauve px-4 py-2.5 text-sm font-medium text-ctp-base transition-colors hover:bg-ctp-mauve/80 focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base"
              >
                Add Server
              </button>
            </div>

            <p className="text-center text-xs text-ctp-subtext0">
              Passwords are never stored. You'll need to enter it each time.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
