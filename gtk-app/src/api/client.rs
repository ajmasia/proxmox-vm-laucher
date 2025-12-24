use reqwest::Client;
use super::error::{ApiError, Result};

/// Create HTTP client configured for Proxmox API
///
/// Note: Accepts invalid certificates for self-signed Proxmox installations
pub fn create_client() -> Result<Client> {
    Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(ApiError::Client)
}
