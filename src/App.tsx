function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Proxmox VM Launcher
        </h1>
        <p className="mb-4 text-slate-600">
          Connect to your Proxmox virtual machines with ease
        </p>
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
