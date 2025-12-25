# PVE Launcher

[![CI](https://github.com/ajmasia/proxmox-vm-laucher/actions/workflows/ci.yml/badge.svg)](https://github.com/ajmasia/proxmox-vm-laucher/actions/workflows/ci.yml)
[![Release](https://github.com/ajmasia/proxmox-vm-laucher/actions/workflows/release.yml/badge.svg)](https://github.com/ajmasia/proxmox-vm-laucher/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/ajmasia/proxmox-vm-laucher?logo=github)](https://github.com/ajmasia/proxmox-vm-laucher/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Electron](https://img.shields.io/badge/Electron-39.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Desktop application to manage and connect to Proxmox VMs using SPICE.

## Features

- Connect to multiple Proxmox VE servers
- View and manage virtual machines
- Start, stop, suspend, and resume VMs
- Quick SPICE connection to VMs with QXL graphics
- Filter VMs by status and tags
- Dark/light theme support
- Custom window decorations (GTK4/Adwaita style)

## Requirements

- Node.js 18+
- `remote-viewer` (virt-viewer) for SPICE connections
- A Proxmox VE server with API access

### Installing remote-viewer

**Debian/Ubuntu:**
```bash
sudo apt install virt-viewer
```

**Fedora:**
```bash
sudo dnf install virt-viewer
```

**Arch Linux:**
```bash
sudo pacman -S virt-viewer
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Project Structure

```
pve-launcher/
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry point
│   └── preload.ts     # Preload script for IPC
├── src/               # React application
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── layouts/       # Layout components
│   ├── stores/        # Zustand state stores
│   ├── contexts/      # React contexts
│   ├── icons/         # SVG icon components
│   └── types/         # TypeScript types
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
└── package.json       # Project dependencies
```

## Technology Stack

- **Electron** - Desktop application framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation

## Usage

1. Launch the application
2. Add a Proxmox server (host, port, username)
3. Enter your password to authenticate
4. Browse and manage your virtual machines
5. Click the SPICE button to connect to a running VM

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
