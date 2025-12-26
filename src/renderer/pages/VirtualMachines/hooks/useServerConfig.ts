import { useConfigStore } from '../../../stores/useConfigStore'

export const useServerConfig = () => {
  const { hasConfig, configLoaded, success, error, checkConfig, saveConfig, setHasConfig } =
    useConfigStore()

  return {
    hasConfig,
    configLoaded,
    success,
    error,
    checkConfig,
    saveConfig,
    reconfigure: () => setHasConfig(false),
  }
}
