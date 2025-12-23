mod config;
mod proxmox;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            save_server_config,
            load_server_config,
            delete_server_config,
            authenticate,
            get_cluster_name,
            list_vms,
            list_vms_with_session,
            start_vm,
            start_vm_with_session,
            stop_vm,
            stop_vm_with_session,
            suspend_vm,
            suspend_vm_with_session,
            resume_vm,
            resume_vm_with_session,
            connect_to_proxmox,
            connect_to_proxmox_with_session
        ])
        .setup(|_app| {
            // DevTools disabled by default
            // Uncomment the following lines to enable devtools in development
            // #[cfg(debug_assertions)]
            // {
            //     let window = app.get_webview_window("main").unwrap();
            //     window.open_devtools();
            // }
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
async fn stop_vm(app: tauri::AppHandle, node: String, vmid: u32) -> Result<(), String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Stop the VM
    proxmox::stop_vm(
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
async fn suspend_vm(app: tauri::AppHandle, node: String, vmid: u32) -> Result<(), String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Suspend the VM
    proxmox::suspend_vm(
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
async fn resume_vm(app: tauri::AppHandle, node: String, vmid: u32) -> Result<(), String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Resume the VM
    proxmox::resume_vm(
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
async fn connect_to_proxmox(app: tauri::AppHandle, node: String, vmid: u32) -> Result<(), String> {
    // Load server config
    let config = config::load_config(&app)?;

    // Create ProxmoxConnection from config
    let connection = proxmox::ProxmoxConnection {
        name: String::from("default"),
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        node,
        vmid: vmid.to_string(),
    };

    // Authenticate with Proxmox
    let tokens = proxmox::authenticate(&connection).await?;

    // Get SPICE configuration
    let spice_config = proxmox::get_spice_config(&connection, &tokens).await?;

    // Save SPICE config to temporary file and launch remote-viewer
    proxmox::launch_spice_viewer(&spice_config)?;

    Ok(())
}

#[tauri::command]
async fn connect_to_proxmox_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
    node: String,
    vmid: u32,
) -> Result<(), String> {
    // Create ProxmoxConnection from session
    let connection = proxmox::ProxmoxConnection {
        name: String::from("default"),
        host,
        port,
        username,
        password,
        node,
        vmid: vmid.to_string(),
    };

    // Authenticate with Proxmox
    let tokens = proxmox::authenticate(&connection).await?;

    // Get SPICE configuration
    let spice_config = proxmox::get_spice_config(&connection, &tokens).await?;

    // Save SPICE config to temporary file and launch remote-viewer
    proxmox::launch_spice_viewer(&spice_config)?;

    Ok(())
}

// New authentication system commands

#[derive(serde::Deserialize)]
struct ServerConfig {
    host: String,
    port: u16,
    username: String,
    password: String,
}

#[derive(serde::Serialize)]
struct AuthResult {
    ticket: String,
    #[serde(rename = "csrfToken")]
    csrf_token: String,
}

#[tauri::command]
async fn authenticate(config: ServerConfig) -> Result<AuthResult, String> {
    let connection = proxmox::ProxmoxConnection {
        name: String::from(""),
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        node: String::from(""),
        vmid: String::from(""),
    };

    let tokens = proxmox::authenticate(&connection).await?;

    Ok(AuthResult {
        ticket: tokens.ticket,
        csrf_token: tokens.csrf_token,
    })
}

#[tauri::command]
async fn get_cluster_name(config: ServerConfig) -> Result<String, String> {
    proxmox::get_cluster_name(&config.host, config.port, &config.username, &config.password).await
}

#[tauri::command]
async fn list_vms_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
) -> Result<Vec<proxmox::VMInfo>, String> {
    proxmox::list_vms(&host, port, &username, &password).await
}

#[tauri::command]
async fn start_vm_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
    node: String,
    vmid: u32,
) -> Result<(), String> {
    proxmox::start_vm(&host, port, &username, &password, &node, vmid).await
}

#[tauri::command]
async fn stop_vm_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
    node: String,
    vmid: u32,
) -> Result<(), String> {
    proxmox::stop_vm(&host, port, &username, &password, &node, vmid).await
}

#[tauri::command]
async fn suspend_vm_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
    node: String,
    vmid: u32,
) -> Result<(), String> {
    proxmox::suspend_vm(&host, port, &username, &password, &node, vmid).await
}

#[tauri::command]
async fn resume_vm_with_session(
    host: String,
    port: u16,
    username: String,
    password: String,
    node: String,
    vmid: u32,
) -> Result<(), String> {
    proxmox::resume_vm(&host, port, &username, &password, &node, vmid).await
}
