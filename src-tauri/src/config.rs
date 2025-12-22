use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

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

#[derive(Debug, Serialize, Deserialize)]
struct StoredConfig {
    config: ServerConfig,
    password_encoded: String,
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;

    Ok(app_dir.join("config.json"))
}

pub fn save_config(app: &AppHandle, config: &ServerConfigWithPassword) -> Result<(), String> {
    println!("Saving config for host: {}", config.host);

    let server_config = ServerConfig {
        host: config.host.clone(),
        port: config.port,
        username: config.username.clone(),
    };

    // Simple base64 encoding (not encryption, just obfuscation)
    let password_encoded = base64::Engine::encode(
        &base64::engine::general_purpose::STANDARD,
        config.password.as_bytes(),
    );

    let stored = StoredConfig {
        config: server_config,
        password_encoded,
    };

    let config_path = get_config_path(app)?;
    let json = serde_json::to_string_pretty(&stored)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    println!("Config saved to: {:?}", config_path);

    Ok(())
}

pub fn load_config(app: &AppHandle) -> Result<ServerConfigWithPassword, String> {
    println!("Loading config...");

    let config_path = get_config_path(app)?;

    if !config_path.exists() {
        return Err("No configuration found".to_string());
    }

    let json = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let stored: StoredConfig = serde_json::from_str(&json)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    let password_bytes = base64::Engine::decode(
        &base64::engine::general_purpose::STANDARD,
        &stored.password_encoded,
    )
    .map_err(|e| format!("Failed to decode password: {}", e))?;

    let password = String::from_utf8(password_bytes)
        .map_err(|e| format!("Failed to convert password: {}", e))?;

    println!("Config loaded successfully");

    Ok(ServerConfigWithPassword {
        host: stored.config.host,
        port: stored.config.port,
        username: stored.config.username,
        password,
    })
}

pub fn delete_config(app: &AppHandle) -> Result<(), String> {
    let config_path = get_config_path(app)?;

    if config_path.exists() {
        std::fs::remove_file(&config_path)
            .map_err(|e| format!("Failed to delete config: {}", e))?;
    }

    Ok(())
}
