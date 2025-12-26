/**
 * UpdateBadge component - Currently unused but kept for future use.
 * This component was part of the original implementation and may be
 * needed for showing update notifications in upcoming versions.
 */

import { useUpdateStore } from '../../stores/updateStore'
import { DownloadIcon } from '../../icons'
import { Tooltip } from '../Tooltip/Tooltip'

export const UpdateBadge = () => {
  const { updateAvailable, latestRelease, openReleasesPage, isChecking } = useUpdateStore()

  if (!updateAvailable || !latestRelease) return null

  return (
    <Tooltip text={`Update to ${latestRelease.version}`} position="top">
      <button
        onClick={openReleasesPage}
        disabled={isChecking}
        className="relative inline-flex items-center gap-1.5 rounded-lg bg-ctp-green/20 px-2.5 py-1.5 text-sm font-medium text-ctp-green transition-all duration-200 hover:scale-105 hover:bg-ctp-green/30 active:scale-95"
      >
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ctp-green opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-ctp-green"></span>
        </span>
        <DownloadIcon className="h-4 w-4" />
        <span>{latestRelease.version}</span>
      </button>
    </Tooltip>
  )
}
