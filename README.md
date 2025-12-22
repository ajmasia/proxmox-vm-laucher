# Proxmox VM Launcher

A cross-platform desktop application for connecting to Proxmox virtual machines via SPICE protocol.

## Features

- Connect to Proxmox VMs through an intuitive GUI
- Manage multiple VM profiles
- Secure credential storage
- Cross-platform support (Windows, macOS, Linux)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri 2.x
- **Build Tool**: Vite 6
- **Testing**: Vitest
- **Code Quality**: ESLint + Prettier

## Prerequisites

### System Requirements

- Node.js 18+ and npm
- Rust 1.70+ (install from [rustup.rs](https://rustup.rs))
- Git

### Linux-specific Dependencies

#### Ubuntu/Debian
```bash
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Fedora/RHEL
```bash
sudo dnf install webkit2gtk4.1-devel libsoup3-devel
```

#### Arch Linux
```bash
sudo pacman -S webkit2gtk-4.1 libsoup3
```

### Development Tools

Install Tauri CLI globally:
```bash
cargo install tauri-cli --version '^2.0.0'
```

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd proxmox-vm-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

## Available Scripts

- `npm run dev` - Start Vite dev server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run tauri dev` - Run Tauri app in development mode
- `npm run tauri build` - Build Tauri app for production
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier

## Project Structure

```
proxmox-vm-launcher/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   └── lib.rs         # Tauri logic
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Tauri configuration
│   └── icons/             # Application icons
├── index.html             # HTML entry
├── package.json           # Node dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── eslint.config.js       # ESLint configuration
```

## Development

The application uses Tauri's IPC (Inter-Process Communication) to communicate between the React frontend and Rust backend.

### Adding Tauri Commands

1. Define the command in `src-tauri/src/lib.rs`:
```rust
#[tauri::command]
fn my_command(param: String) -> Result<String, String> {
    Ok(format!("Received: {}", param))
}
```

2. Register the command:
```rust
.invoke_handler(tauri::generate_handler![my_command])
```

3. Call from React:
```typescript
import { invoke } from '@tauri-apps/api/core'

const result = await invoke('my_command', { param: 'value' })
```

## Building for Production

### Development Build
```bash
npm run tauri build
```

This will create platform-specific bundles in `src-tauri/target/release/bundle/`.

### Supported Platforms
- Linux: `.deb`, `.AppImage`
- macOS: `.dmg`, `.app`
- Windows: `.msi`, `.exe`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license here]

## Original Script

The project is based on the `pve-connect.sh` script for connecting to Proxmox VMs via SPICE.
