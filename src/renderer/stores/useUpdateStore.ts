import { create } from 'zustand'
import { toast } from 'sonner'

const GITHUB_REPO = 'ajmasia/proxmox-vm-laucher'
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`

interface ReleaseInfo {
  version: string
  name: string
  body: string
  url: string
  publishedAt: string
}

interface UpdateStore {
  // State
  currentVersion: string | null
  latestRelease: ReleaseInfo | null
  updateAvailable: boolean
  isChecking: boolean
  lastChecked: Date | null

  // Actions
  checkForUpdates: () => Promise<void>
  openReleasesPage: () => Promise<void>
  dismissUpdate: () => void
}

// Compare semantic versions: returns true if v2 > v1
function isNewerVersion(v1: string, v2: string): boolean {
  const normalize = (v: string) => v.replace(/^v/, '').split('.').map(Number)
  const [major1, minor1, patch1] = normalize(v1)
  const [major2, minor2, patch2] = normalize(v2)

  if (major2 > major1) return true
  if (major2 < major1) return false
  if (minor2 > minor1) return true
  if (minor2 < minor1) return false
  return patch2 > patch1
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
  // Initial state
  currentVersion: null,
  latestRelease: null,
  updateAvailable: false,
  isChecking: false,
  lastChecked: null,

  // Check for updates
  checkForUpdates: async () => {
    set({ isChecking: true })

    try {
      // Get current app version via Electron IPC
      const currentVersion = await window.electronAPI.getVersion()
      set({ currentVersion })

      // Fetch latest release from GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch release info: ${response.status}`)
      }

      const data = await response.json()

      const latestRelease: ReleaseInfo = {
        version: data.tag_name,
        name: data.name || data.tag_name,
        body: data.body || '',
        url: data.html_url,
        publishedAt: data.published_at,
      }

      const updateAvailable = isNewerVersion(currentVersion, latestRelease.version)

      set({
        latestRelease,
        updateAvailable,
        lastChecked: new Date(),
      })

      if (updateAvailable) {
        toast.info(`New version ${latestRelease.version} available`, {
          action: {
            label: 'View',
            onClick: () => get().openReleasesPage(),
          },
          duration: 8000,
        })
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    } finally {
      set({ isChecking: false })
    }
  },

  // Open releases page in browser
  openReleasesPage: async () => {
    const { latestRelease } = get()
    const url = latestRelease?.url || RELEASES_URL
    await window.electronAPI.openExternal(url)
  },

  // Dismiss update notification
  dismissUpdate: () => {
    set({ updateAvailable: false })
  },
}))
