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
      return `${base} bg-ctp-green/10 text-ctp-green border-ctp-green/20`
    case 'stopped':
      return `${base} bg-ctp-overlay0/10 text-ctp-overlay1 border-ctp-overlay0/20`
    case 'paused':
      return `${base} bg-ctp-yellow/10 text-ctp-yellow border-ctp-yellow/20`
    // Transitional states
    case 'starting':
    case 'resuming':
      return `${base} bg-ctp-green/10 text-ctp-green border-ctp-green/20`
    case 'stopping':
      return `${base} bg-ctp-overlay0/10 text-ctp-overlay1 border-ctp-overlay0/20`
    case 'pausing':
      return `${base} bg-ctp-yellow/10 text-ctp-yellow border-ctp-yellow/20`
    default:
      return `${base} bg-ctp-overlay0/10 text-ctp-overlay1 border-ctp-overlay0/20`
  }
}

export const getStatusDot = (status: string) => {
  const base = 'transition-colors duration-300'
  switch (status) {
    case 'running':
      return `${base} bg-ctp-green animate-pulse`
    case 'stopped':
      return `${base} bg-ctp-overlay0`
    case 'paused':
      return `${base} bg-ctp-yellow`
    // Transitional states - use faster pulse animation
    case 'starting':
    case 'resuming':
      return `${base} bg-ctp-green animate-[pulse_0.75s_ease-in-out_infinite]`
    case 'stopping':
      return `${base} bg-ctp-overlay0 animate-[pulse_0.75s_ease-in-out_infinite]`
    case 'pausing':
      return `${base} bg-ctp-yellow animate-[pulse_0.75s_ease-in-out_infinite]`
    default:
      return `${base} bg-ctp-overlay0`
  }
}

// Check if status is a transitional state
export const isTransitionalStatus = (status: string) => {
  return ['starting', 'stopping', 'pausing', 'resuming'].includes(status)
}
