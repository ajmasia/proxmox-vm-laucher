# Propuesta: Módulo Window (Arquitectura Completa)

## Objetivo

Aislar toda la lógica de gestión de ventana en un módulo dedicado que abarque tanto el proceso principal (Electron) como el renderer (React).

## Estructura Propuesta

```
electron/
├── main.ts              # Solo setup general de Electron
├── preload.ts           # Solo bridge general
└── modules/
    └── window/
        ├── window.main.ts     # ipcMain handlers de ventana
        └── window.preload.ts  # Exposición específica de window

src/modules/window/
├── window.api.ts        # Wrapper tipado sobre electronAPI
├── useWindowState.ts    # Hook React para estado (isMaximized, isFullscreen)
└── index.ts             # Exports públicos
```

## Detalle por Capa

### 1. Main Process (`electron/modules/window/`)

**window.main.ts**
- `window:show`, `window:close`, `window:minimize`, `window:maximize`
- `window:isMaximized`
- Eventos `maximize`, `unmaximize`, `enter-full-screen`, `leave-full-screen`
- Función `setupWindowHandlers(mainWindow: BrowserWindow)`

**window.preload.ts**
- Exposición específica: `showWindow`, `closeWindow`, `minimizeWindow`, `maximizeWindow`
- `isMaximized`, `onMaximizedChange`

### 2. Renderer (`src/modules/window/`)

**window.api.ts**
```typescript
export const windowAPI = {
  show: () => window.electronAPI.showWindow(),
  close: () => window.electronAPI.closeWindow(),
  minimize: () => window.electronAPI.minimizeWindow(),
  maximize: () => window.electronAPI.maximizeWindow(),
  isMaximized: () => window.electronAPI.isMaximized(),
  onMaximizedChange: (cb: (isMaximized: boolean) => void) =>
    window.electronAPI.onMaximizedChange(cb),
}
```

**useWindowState.ts**
```typescript
export function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    windowAPI.isMaximized().then(setIsMaximized)
    windowAPI.onMaximizedChange(setIsMaximized)
  }, [])

  return { isMaximized }
}
```

### 3. Uso en App.tsx

```typescript
import { useWindowState } from './modules/window'

function App() {
  const { isMaximized } = useWindowState()

  return (
    <div className={clsx('...', !isMaximized && 'rounded-xl')}>
      ...
    </div>
  )
}
```

## Beneficios

1. **Cohesión**: Todo lo de window está junto
2. **Reutilizable**: El hook se puede usar en cualquier componente
3. **Testeable**: Fácil de mockear `windowAPI` en tests
4. **Escalable**: Patrón replicable para otros módulos (proxmox, app, shell)

## Estado

- [ ] Pendiente de implementación
- Fecha: 2024-12-25
