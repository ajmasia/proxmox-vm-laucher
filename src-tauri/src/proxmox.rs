use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxmoxConnection {
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub node: String,
    pub vmid: String,
}

#[derive(Debug, Deserialize)]
struct AuthResponse {
    data: AuthData,
}

#[derive(Debug, Deserialize)]
struct AuthData {
    ticket: String,
    #[serde(rename = "CSRFPreventionToken")]
    csrf_token: String,
}

#[derive(Debug, Serialize)]
pub struct AuthTokens {
    pub ticket: String,
    pub csrf_token: String,
}

pub async fn authenticate(connection: &ProxmoxConnection) -> Result<AuthTokens, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!(
        "https://{}:{}/api2/json/access/ticket",
        connection.host, connection.port
    );

    let params = [
        ("username", connection.username.as_str()),
        ("password", connection.password.as_str()),
    ];

    let response = client
        .post(&url)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Authentication request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Authentication failed with status: {}",
            response.status()
        ));
    }

    let auth_response: AuthResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse authentication response: {}", e))?;

    Ok(AuthTokens {
        ticket: auth_response.data.ticket,
        csrf_token: auth_response.data.csrf_token,
    })
}

pub async fn get_spice_config(
    connection: &ProxmoxConnection,
    tokens: &AuthTokens,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!(
        "https://{}:{}/api2/spiceconfig/nodes/{}/qemu/{}/spiceproxy",
        connection.host, connection.port, connection.node, connection.vmid
    );

    let response = client
        .post(&url)
        .header("CSRFPreventionToken", &tokens.csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .send()
        .await
        .map_err(|e| format!("SPICE config request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Failed to get SPICE config with status: {}",
            response.status()
        ));
    }

    response
        .text()
        .await
        .map_err(|e| format!("Failed to read SPICE config: {}", e))
}
