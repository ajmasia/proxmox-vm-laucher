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
            list_vms,
            start_vm,
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
async fn save_server_config(
    app: tauri::AppHandle,
    config: config::ServerConfigWithPassword,
) -> Result<(), String> {
    config::save_config(&app, &config)
}

#[tauri::command]
async fn load_server_config(app: tauri::AppHandle) -> Result<config::ServerConfigWithPassword, String> {
    config::load_config(&app)
}

#[tauri::command]
async fn delete_server_config(app: tauri::AppHandle) -> Result<(), String> {
    config::delete_config(&app)
}

#[tauri::command]
async fn list_vms(app: tauri::AppHandle) -> Result<Vec<proxmox::VMInfo>, String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Fetch VM list
    proxmox::list_vms(&config.host, config.port, &config.username, &config.password).await
}

#[tauri::command]
async fn start_vm(app: tauri::AppHandle, node: String, vmid: u32) -> Result<(), String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Start the VM
    proxmox::start_vm(
        &config.host,
        config.port,
        &config.username,
        &config.password,
        &node,
        vmid,
    )
    .await
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
