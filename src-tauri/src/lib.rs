use tauri::Manager;

mod proxmox;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![connect_to_proxmox])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn connect_to_proxmox(connection: proxmox::ProxmoxConnection) -> Result<String, String> {
    // Authenticate with Proxmox
    let tokens = proxmox::authenticate(&connection).await?;

    // Get SPICE configuration
    let spice_config = proxmox::get_spice_config(&connection, &tokens).await?;

    // TODO: Save SPICE config to file and launch remote-viewer
    Ok(spice_config)
}
