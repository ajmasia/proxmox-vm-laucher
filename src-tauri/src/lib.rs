use tauri::Manager;

mod config;
mod proxmox;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            save_server_config,
            load_server_config,
            delete_server_config,
            connect_to_proxmox
        ])
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
async fn save_server_config(config: config::ServerConfigWithPassword) -> Result<(), String> {
    config::save_config(&config)
}

#[tauri::command]
async fn load_server_config() -> Result<config::ServerConfigWithPassword, String> {
    config::load_config()
}

#[tauri::command]
async fn delete_server_config() -> Result<(), String> {
    config::delete_config()
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
