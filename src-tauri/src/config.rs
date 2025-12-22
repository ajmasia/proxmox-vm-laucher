use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE_NAME: &str = "com.proxmox.vmlauncher";
const CONFIG_KEY: &str = "server_config";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerConfigWithPassword {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

pub fn save_config(config: &ServerConfigWithPassword) -> Result<(), String> {
    // Save non-sensitive data as JSON
    let server_config = ServerConfig {
        host: config.host.clone(),
        port: config.port,
        username: config.username.clone(),
    };

    let config_json =
        serde_json::to_string(&server_config).map_err(|e| format!("Failed to serialize config: {}", e))?;

    // Save to keyring (config)
    let entry = Entry::new(SERVICE_NAME, CONFIG_KEY)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    entry
        .set_password(&config_json)
        .map_err(|e| format!("Failed to save config: {}", e))?;

    // Save password separately
    let password_key = format!("{}_password", config.host);
    let password_entry = Entry::new(SERVICE_NAME, &password_key)
        .map_err(|e| format!("Failed to create password entry: {}", e))?;

    password_entry
        .set_password(&config.password)
        .map_err(|e| format!("Failed to save password: {}", e))?;

    Ok(())
}

pub fn load_config() -> Result<ServerConfigWithPassword, String> {
    // Load config from keyring
    let entry = Entry::new(SERVICE_NAME, CONFIG_KEY)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    let config_json = entry
        .get_password()
        .map_err(|e| format!("No configuration found: {}", e))?;

    let server_config: ServerConfig = serde_json::from_str(&config_json)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    // Load password
    let password_key = format!("{}_password", server_config.host);
    let password_entry = Entry::new(SERVICE_NAME, &password_key)
        .map_err(|e| format!("Failed to create password entry: {}", e))?;

    let password = password_entry
        .get_password()
        .map_err(|e| format!("Failed to load password: {}", e))?;

    Ok(ServerConfigWithPassword {
        host: server_config.host,
        port: server_config.port,
        username: server_config.username,
        password,
    })
}

pub fn delete_config() -> Result<(), String> {
    // Try to load config first to get the host for password key
    if let Ok(config) = load_config() {
        let password_key = format!("{}_password", config.host);
        let password_entry = Entry::new(SERVICE_NAME, &password_key)
            .map_err(|e| format!("Failed to create password entry: {}", e))?;

        let _ = password_entry.delete_credential();
    }

    // Delete main config
    let entry = Entry::new(SERVICE_NAME, CONFIG_KEY)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    entry
        .delete_credential()
        .map_err(|e| format!("Failed to delete config: {}", e))?;

    Ok(())
}
