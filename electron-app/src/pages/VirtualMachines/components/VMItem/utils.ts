export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

export const getStatusColor = (status: string) => {
  const base = 'transition-colors duration-300'
  switch (status) {
    case 'running':
      return `${base} bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30`
    case 'stopped':
      return `${base} bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30`
    case 'paused':
      return `${base} bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30`
    // Transitional states
    case 'starting':
    case 'resuming':
      return `${base} bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30`
    case 'stopping':
      return `${base} bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30`
    case 'pausing':
      return `${base} bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30`
    default:
      return `${base} bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30`
  }
}

export const getStatusDot = (status: string) => {
  const base = 'transition-colors duration-300'
  switch (status) {
    case 'running':
      return `${base} bg-emerald-500 animate-pulse`
    case 'stopped':
      return `${base} bg-slate-400`
    case 'paused':
      return `${base} bg-amber-500`
    // Transitional states - use faster pulse animation
    case 'starting':
    case 'resuming':
      return `${base} bg-emerald-500 animate-[pulse_0.75s_ease-in-out_infinite]`
    case 'stopping':
      return `${base} bg-slate-400 animate-[pulse_0.75s_ease-in-out_infinite]`
    case 'pausing':
      return `${base} bg-amber-500 animate-[pulse_0.75s_ease-in-out_infinite]`
    default:
      return `${base} bg-slate-400`
  }
}

// Check if status is a transitional state
export const isTransitionalStatus = (status: string) => {
  return ['starting', 'stopping', 'pausing', 'resuming'].includes(status)
}
