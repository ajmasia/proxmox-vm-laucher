import ConnectionForm from './components/ConnectionForm'
import type { ProxmoxConnection } from './types/proxmox'

function App() {
  const handleConnect = (connection: ProxmoxConnection) => {
    console.log('Connecting to:', connection)
    // TODO: Implement Tauri backend call
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Proxmox VM Launcher</h1>
        <p className="mb-6 text-slate-600">
          Connect to your Proxmox virtual machines with ease
        </p>
        <ConnectionForm onSubmit={handleConnect} />
      </div>
    </div>
  )
}

export default App
