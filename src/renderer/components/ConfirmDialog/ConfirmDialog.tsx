/**
 * ConfirmDialog component - Currently unused but kept for future use.
 * This component was part of the original implementation and may be
 * needed for confirmation dialogs in upcoming features.
 */

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-crust/80">
      <div className="w-full max-w-lg rounded-xl bg-ctp-base shadow-2xl ring-1 ring-ctp-surface0">
        <div className="border-b border-ctp-surface0 px-6 py-4">
          <h3 className="text-lg font-semibold text-ctp-text">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-ctp-subtext1">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-ctp-surface0 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-ctp-surface1 bg-ctp-surface0 px-4 py-2 text-sm font-medium text-ctp-text transition-colors hover:bg-ctp-surface1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-ctp-blue px-4 py-2 text-sm font-medium text-ctp-base transition-colors hover:bg-ctp-blue/80"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
