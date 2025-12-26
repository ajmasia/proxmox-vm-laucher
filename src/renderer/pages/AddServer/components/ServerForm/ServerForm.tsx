interface ServerFormData {
  name: string
  host: string
  port: number
  username: string
}

interface ServerFormProps {
  formData: ServerFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ServerForm = ({ formData, onChange }: ServerFormProps) => {
  return (
    <div className="flex-1 space-y-4">
      {/* Server Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ctp-subtext1">
          Server Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          autoFocus
          className="block w-full rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2.5 text-sm text-ctp-text shadow-sm transition-colors placeholder:text-ctp-overlay1 hover:border-ctp-surface2 focus:border-ctp-mauve focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-0"
          placeholder="Production Server"
        />
      </div>

      {/* Host */}
      <div>
        <label htmlFor="host" className="mb-1.5 block text-sm font-medium text-ctp-subtext1">
          Host
        </label>
        <input
          type="text"
          id="host"
          name="host"
          value={formData.host}
          onChange={onChange}
          required
          className="block w-full rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2.5 text-sm text-ctp-text shadow-sm transition-colors placeholder:text-ctp-overlay1 hover:border-ctp-surface2 focus:border-ctp-mauve focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-0"
          placeholder="192.168.1.100"
        />
      </div>

      {/* Port */}
      <div>
        <label htmlFor="port" className="mb-1.5 block text-sm font-medium text-ctp-subtext1">
          Port
        </label>
        <input
          type="number"
          id="port"
          name="port"
          value={formData.port}
          onChange={onChange}
          required
          className="block w-full rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2.5 text-sm text-ctp-text shadow-sm transition-colors placeholder:text-ctp-overlay1 hover:border-ctp-surface2 focus:border-ctp-mauve focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-0"
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-ctp-subtext1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          required
          className="block w-full rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2.5 text-sm text-ctp-text shadow-sm transition-colors placeholder:text-ctp-overlay1 hover:border-ctp-surface2 focus:border-ctp-mauve focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-0"
          placeholder="root@pam"
        />
      </div>
    </div>
  )
}
