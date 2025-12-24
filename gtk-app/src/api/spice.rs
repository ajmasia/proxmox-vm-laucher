use std::fs;
use std::process::Command;
use super::client::create_client;
use super::error::{ApiError, Result};
use crate::models::{AuthTokens, ProxmoxConnection};

/// Get SPICE configuration for a VM
pub async fn get_spice_config(
    connection: &ProxmoxConnection,
    tokens: &AuthTokens,
) -> Result<String> {
    let client = create_client()?;

    // First, verify VM exists
    let status_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/current",
        connection.host, connection.port, connection.node, connection.vmid
    );

    let status_response = client
        .get(&status_url)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .send()
        .await?;

    if !status_response.status().is_success() {
        return Err(ApiError::VMNotFound(format!(
            "VM {} not found on node {}",
            connection.vmid, connection.node
        )));
    }

    // Get SPICE config
    let url = format!(
        "https://{}:{}/api2/spiceconfig/nodes/{}/qemu/{}/spiceproxy",
        connection.host, connection.port, connection.node, connection.vmid
    );

    let response = client
        .post(&url)
        .header("CSRFPreventionToken", &tokens.csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .form(&[("proxy", connection.host.as_str())])
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Spice(format!(
            "Failed to get SPICE config ({}): {}",
            status, body
        )));
    }

    response.text().await.map_err(|e| ApiError::Spice(e.to_string()))
}

/// Launch remote-viewer with SPICE config
pub fn launch_spice_viewer(spice_config: &str) -> Result<()> {
    let temp_dir = std::env::temp_dir();
    let config_path = temp_dir.join(format!("spice-{}.vv", std::process::id()));

    fs::write(&config_path, spice_config)?;

    Command::new("remote-viewer")
        .arg(&config_path)
        .spawn()
        .map_err(|e| ApiError::Spice(format!(
            "Failed to launch remote-viewer: {}. Make sure 'remote-viewer' is installed.",
            e
        )))?;

    Ok(())
}
