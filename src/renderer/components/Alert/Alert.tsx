import { ErrorIcon, SuccessIcon, InfoIcon, WarningIcon } from '../../icons'

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning'
  message: string
}

const alertStyles = {
  error: {
    container: 'border-ctp-red/30 bg-ctp-red/10',
    icon: 'text-ctp-red',
    text: 'text-ctp-red',
  },
  success: {
    container: 'border-ctp-green/30 bg-ctp-green/10',
    icon: 'text-ctp-green',
    text: 'text-ctp-green',
  },
  info: {
    container: 'border-ctp-blue/30 bg-ctp-blue/10',
    icon: 'text-ctp-blue',
    text: 'text-ctp-blue',
  },
  warning: {
    container: 'border-ctp-yellow/30 bg-ctp-yellow/10',
    icon: 'text-ctp-yellow',
    text: 'text-ctp-yellow',
  },
}

const icons = {
  error: ErrorIcon,
  success: SuccessIcon,
  info: InfoIcon,
  warning: WarningIcon,
}

export const Alert = ({ type, message }: AlertProps) => {
  const styles = alertStyles[type]
  const Icon = icons[type]

  return (
    <div className={`mb-6 rounded-xl border p-4 shadow-sm ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
        </div>
      </div>
    </div>
  )
}
