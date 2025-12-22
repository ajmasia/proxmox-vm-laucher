export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
    case 'stopped':
      return 'bg-slate-500/10 text-slate-700 border-slate-500/20'
    case 'paused':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    default:
      return 'bg-slate-500/10 text-slate-700 border-slate-500/20'
  }
}

export const getStatusDot = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-emerald-500'
    case 'stopped':
      return 'bg-slate-400'
    case 'paused':
      return 'bg-amber-500'
    default:
      return 'bg-slate-400'
  }
}
