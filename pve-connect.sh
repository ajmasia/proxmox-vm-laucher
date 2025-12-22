#!/bin/bash

# === CONFIGURACIÓN ===
PROXMOX_HOST="192.168.4.10" # IP real de Proxmox
PROXMOX_PORT="8006"
PROXMOX_USER="root@pam"    # Tu usuario
PROXMOX_PASS="no#cx8sy7jW" # Tu contraseña
NODE="pve2"                # Nombre del nodo (normalmente 'pve')
VMID="204"                 # ID de tu VM

# === AUTENTICACIÓN ===
echo "Autenticando en Proxmox..."
AUTH=$(curl -s -k -d "username=${PROXMOX_USER}&password=${PROXMOX_PASS}" \
  "https://${PROXMOX_HOST}:${PROXMOX_PORT}/api2/json/access/ticket")

TICKET=$(echo "$AUTH" | grep -oP '"ticket":"\K[^"]+')
CSRF=$(echo "$AUTH" | grep -oP '"CSRFPreventionToken":"\K[^"]+')

if [ -z "$TICKET" ]; then
  echo "Error: No se pudo autenticar"
  exit 1
fi

# === OBTENER CONFIGURACIÓN SPICE ===
echo "Obteniendo conexión SPICE..."
curl -s -k \
  -b "PVEAuthCookie=${TICKET}" \
  -H "CSRFPreventionToken: ${CSRF}" \
  -X POST \
  "https://${PROXMOX_HOST}:${PROXMOX_PORT}/api2/spiceconfig/nodes/${NODE}/qemu/${VMID}/spiceproxy" \
  -o /tmp/pve-spice.vv

# === CONECTAR ===
echo "Abriendo conexión..."
remote-viewer /tmp/pve-spice.vv
