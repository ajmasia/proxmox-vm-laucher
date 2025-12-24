# Plan de Migración a GTK Nativo

## Resumen

Exploración para migrar PVE Launcher de Tauri (React + Rust) a GTK4 nativo con Rust.

## Stack Propuesto

```
┌─────────────────────────────────────┐
│           Libadwaita                │  ← Widgets y estilos GNOME
├─────────────────────────────────────┤
│             GTK4                    │  ← Toolkit UI
├─────────────────────────────────────┤
│             Relm4                   │  ← Framework (patrón Elm/React)
├─────────────────────────────────────┤
│         Rust (Backend)              │  ← Reutilizado de Tauri
└─────────────────────────────────────┘
```

## Dependencias Principales

```toml
[dependencies]
gtk4 = "0.9"
libadwaita = "0.7"
relm4 = "0.9"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

## Fases de Desarrollo

### Fase 1: Setup y POC (Proof of Concept)
- [ ] Crear nuevo proyecto Cargo con gtk4-rs
- [ ] Configurar Libadwaita
- [ ] Crear ventana básica con HeaderBar
- [ ] Verificar que funciona en Wayland/GNOME

### Fase 2: Estructura Base
- [ ] Implementar arquitectura Relm4 (Model, Update, View)
- [ ] Crear componente App principal
- [ ] Implementar navegación (Login → VMs)
- [ ] Estilizar con Libadwaita widgets

### Fase 3: Componentes UI
- [ ] LoginView - Formulario de conexión
- [ ] VMListView - Lista de máquinas virtuales
- [ ] VMItem - Tarjeta individual de VM
- [ ] HeaderBar personalizada con controles
- [ ] Notificaciones toast (AdwToast)

### Fase 4: Integración Backend
- [ ] Migrar módulo `proxmox.rs` (ya existente)
- [ ] Adaptar llamadas async con Relm4
- [ ] Implementar store de estado
- [ ] Conectar acciones (start, stop, connect VM)

### Fase 5: Funcionalidades Avanzadas
- [ ] Persistencia de configuración
- [ ] Detección de actualizaciones
- [ ] Manejo de errores con diálogos
- [ ] Temas claro/oscuro (automático con Libadwaita)

### Fase 6: Evaluación
- [ ] Comparar rendimiento vs Tauri
- [ ] Evaluar experiencia de desarrollo
- [ ] Decidir si continuar o volver a Tauri

## Estructura de Archivos Propuesta

```
src/
├── main.rs              # Entry point
├── app.rs               # Componente principal App
├── config.rs            # Configuración (reutilizar)
├── proxmox.rs           # API Proxmox (reutilizar)
├── components/
│   ├── mod.rs
│   ├── header_bar.rs    # HeaderBar personalizada
│   ├── login_view.rs    # Vista de login
│   ├── vm_list.rs       # Lista de VMs
│   └── vm_item.rs       # Item individual VM
├── models/
│   ├── mod.rs
│   ├── app_state.rs     # Estado global
│   └── vm.rs            # Modelo VM
└── utils/
    ├── mod.rs
    └── spice.rs         # Lanzador SPICE (reutilizar)
```

## Ejemplo de Componente Relm4

```rust
use relm4::prelude::*;
use adw::prelude::*;

struct AppModel {
    vms: Vec<VMInfo>,
    loading: bool,
}

#[derive(Debug)]
enum AppMsg {
    LoadVMs,
    VMsLoaded(Vec<VMInfo>),
    StartVM(u32),
    StopVM(u32),
}

#[relm4::component]
impl SimpleComponent for AppModel {
    type Init = ();
    type Input = AppMsg;
    type Output = ();

    view! {
        adw::ApplicationWindow {
            set_title: Some("PVE Launcher"),
            set_default_size: (1200, 860),

            adw::ToolbarView {
                add_top_bar = &adw::HeaderBar {
                    set_title_widget = Some(&gtk::Label::new(Some("PVE Launcher"))),
                },

                #[wrap(Some)]
                set_content = &gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,
                    // ... contenido
                }
            }
        }
    }

    fn init(
        _init: Self::Init,
        root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        let model = AppModel {
            vms: vec![],
            loading: false,
        };
        let widgets = view_output!();
        ComponentParts { model, widgets }
    }

    fn update(&mut self, msg: Self::Input, _sender: ComponentSender<Self>) {
        match msg {
            AppMsg::LoadVMs => self.loading = true,
            AppMsg::VMsLoaded(vms) => {
                self.vms = vms;
                self.loading = false;
            }
            // ...
        }
    }
}
```

## Ventajas de Este Approach

1. **Control total de la ventana** - HeaderBar nativa, botones personalizados
2. **Integración GNOME perfecta** - Sigue las HIG (Human Interface Guidelines)
3. **Rendimiento** - Sin overhead de webview
4. **Binario pequeño** - ~5-10MB vs ~80MB con Tauri
5. **Tema automático** - Libadwaita maneja claro/oscuro
6. **Reutilización** - El backend Rust se mantiene casi intacto

## Desventajas

1. **Solo Linux/GNOME** - No es multiplataforma como Tauri
2. **Curva de aprendizaje** - GTK es diferente a web
3. **Menos flexibilidad visual** - CSS limitado vs Tailwind
4. **Reescritura UI completa** - No se puede migrar React

## Decisión Final

Al completar la Fase 6, decidir:
- **Continuar con GTK** si la experiencia es satisfactoria
- **Volver a Tauri** si las limitaciones no justifican el cambio
- **Mantener ambos** versión GTK para Linux, Tauri para otros OS

---

*Documento creado para la exploración en rama `develop/gtk-native-exploration`*
