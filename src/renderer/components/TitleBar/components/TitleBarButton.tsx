import { ComponentType } from 'react'
import { Tooltip } from '../../Tooltip/Tooltip'

interface TitleBarButtonProps {
  onClick: () => void
  tooltip: string
  icon: ComponentType<{ className?: string }>
  iconClassName?: string
  variant?: 'default' | 'close'
}

export const TitleBarButton = ({
  onClick,
  tooltip,
  icon: Icon,
  iconClassName = 'h-4 w-4',
  variant = 'default',
}: TitleBarButtonProps) => {
  const baseClasses = 'flex h-7 w-7 items-center justify-center rounded-lg transition-all'
  const variantClasses =
    variant === 'close'
      ? 'bg-ctp-surface1/50 text-ctp-subtext0 hover:text-ctp-text'
      : 'text-ctp-text hover:bg-ctp-surface1/50'

  return (
    <Tooltip text={tooltip}>
      <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
        <Icon className={iconClassName} />
      </button>
    </Tooltip>
  )
}
