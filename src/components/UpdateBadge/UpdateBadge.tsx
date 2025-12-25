import { useUpdateStore } from '../../stores/updateStore'
import { DownloadIcon } from '../../icons'
import Tooltip from '../Tooltip/Tooltip'

const UpdateBadge = () => {
  const { updateAvailable, latestRelease, openReleasesPage, isChecking } = useUpdateStore()

  if (!updateAvailable || !latestRelease) return null

  return (
    <Tooltip text={`Update to ${latestRelease.version}`} position="top">
      <button
        onClick={openReleasesPage}
        disabled={isChecking}
        className="relative inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-medium text-emerald-700 transition-all duration-200 hover:scale-105 hover:bg-emerald-200 active:scale-95 dark:bg-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70"
      >
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
        </span>
        <DownloadIcon className="h-4 w-4" />
        <span>{latestRelease.version}</span>
      </button>
    </Tooltip>
  )
}

export default UpdateBadge
