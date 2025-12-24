use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::models::ServerConfig;

/// Stored configuration (list of servers)
#[derive(Debug, Serialize, Deserialize, Default)]
pub struct StoredConfig {
    pub servers: Vec<ServerConfig>,
    pub last_used_server_id: Option<String>,
}

/// Get the config directory path
fn get_config_dir() -> Option<PathBuf> {
    ProjectDirs::from("com", "ajmasia", "pve-launcher")
        .map(|dirs| dirs.config_dir().to_path_buf())
}

/// Get the config file path
fn get_config_path() -> Option<PathBuf> {
    get_config_dir().map(|dir| dir.join("servers.json"))
}

/// Load stored configuration
pub fn load_config() -> StoredConfig {
    let Some(path) = get_config_path() else {
        return StoredConfig::default();
    };

    if !path.exists() {
        return StoredConfig::default();
    }

    match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => StoredConfig::default(),
    }
}

/// Save configuration
pub fn save_config(config: &StoredConfig) -> Result<(), String> {
    let dir = get_config_dir().ok_or("Could not determine config directory")?;
    let path = get_config_path().ok_or("Could not determine config path")?;

    // Create directory if it doesn't exist
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create config directory: {}", e))?;

    // Write config
    let content =
        serde_json::to_string_pretty(config).map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

/// Add a new server to config
pub fn add_server(server: ServerConfig) -> Result<(), String> {
    let mut config = load_config();
    config.servers.push(server);
    save_config(&config)
}

/// Update an existing server
pub fn update_server(server: ServerConfig) -> Result<(), String> {
    let mut config = load_config();
    if let Some(existing) = config.servers.iter_mut().find(|s| s.id == server.id) {
        *existing = server;
        save_config(&config)
    } else {
        Err("Server not found".to_string())
    }
}

/// Delete a server from config
pub fn delete_server(server_id: &str) -> Result<(), String> {
    let mut config = load_config();
    config.servers.retain(|s| s.id != server_id);
    if config.last_used_server_id.as_deref() == Some(server_id) {
        config.last_used_server_id = None;
    }
    save_config(&config)
}

/// Set the last used server
pub fn set_last_used_server(server_id: &str) -> Result<(), String> {
    let mut config = load_config();
    config.last_used_server_id = Some(server_id.to_string());
    save_config(&config)
}

/// Get the last used server
pub fn get_last_used_server() -> Option<ServerConfig> {
    let config = load_config();
    let last_id = config.last_used_server_id?;
    config.servers.into_iter().find(|s| s.id == last_id)
}
