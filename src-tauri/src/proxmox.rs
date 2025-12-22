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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VMInfo {
    pub vmid: u32,
    pub name: String,
    pub status: String,
    pub node: String,
    #[serde(rename = "type")]
    #[serde(default)]
    pub vm_type: String,
    #[serde(default)]
    pub uptime: u64,
    #[serde(default)]
    pub cpus: u32,
    #[serde(default)]
    pub maxmem: u64,
    #[serde(default)]
    pub mem: u64,
    #[serde(default)]
    pub maxdisk: u64,
    #[serde(default)]
    pub disk: u64,
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

#[derive(Debug, Deserialize)]
struct VMListResponse {
    data: Vec<VMInfo>,
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

    // First, let's check if VM exists and get its status
    let status_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/current",
        connection.host, connection.port, connection.node, connection.vmid
    );

    println!("Checking VM status at: {}", status_url);

    let status_response = client
        .get(&status_url)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to check VM status: {}", e))?;

    if !status_response.status().is_success() {
        let status = status_response.status();
        let body = status_response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "VM not found or error checking status ({}). Make sure node='{}' and vmid='{}' are correct. Response: {}",
            status, connection.node, connection.vmid, body
        ));
    }

    let status_body = status_response.text().await.unwrap_or_default();
    println!("VM status response: {}", status_body);

    // Now get SPICE config
    let url = format!(
        "https://{}:{}/api2/spiceconfig/nodes/{}/qemu/{}/spiceproxy",
        connection.host, connection.port, connection.node, connection.vmid
    );

    println!("Requesting SPICE config at: {}", url);

    let response = client
        .post(&url)
        .header("CSRFPreventionToken", &tokens.csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .form(&[("proxy", connection.host.as_str())])
        .send()
        .await
        .map_err(|e| format!("SPICE config request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to get SPICE config with status: {}. Response: {}",
            status, body
        ));
    }

    response
        .text()
        .await
        .map_err(|e| format!("Failed to read SPICE config: {}", e))
}

pub async fn list_vms(host: &str, port: u16, username: &str, password: &str) -> Result<Vec<VMInfo>, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // First, authenticate
    let auth_url = format!("https://{}:{}/api2/json/access/ticket", host, port);

    let params = [("username", username), ("password", password)];

    let response = client
        .post(&auth_url)
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

    let ticket = auth_response.data.ticket;

    // Get list of resources (VMs across all nodes)
    let resources_url = format!("https://{}:{}/api2/json/cluster/resources?type=vm", host, port);

    println!("Fetching VM list from: {}", resources_url);

    let vm_response = client
        .get(&resources_url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch VM list: {}", e))?;

    if !vm_response.status().is_success() {
        let status = vm_response.status();
        let body = vm_response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to fetch VM list with status: {}. Response: {}",
            status, body
        ));
    }

    let vm_list: VMListResponse = vm_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse VM list: {}", e))?;

    let total_count = vm_list.data.len();

    // Filter only VMs (exclude LXC containers)
    let vms_only: Vec<VMInfo> = vm_list
        .data
        .into_iter()
        .filter(|vm| vm.vm_type == "qemu")
        .collect();

    println!("Found {} VMs (filtered from {} total)", vms_only.len(), total_count);

    Ok(vms_only)
}

pub async fn start_vm(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    vmid: u32,
) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Authenticate
    let auth_url = format!("https://{}:{}/api2/json/access/ticket", host, port);
    let params = [("username", username), ("password", password)];

    let response = client
        .post(&auth_url)
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

    let ticket = auth_response.data.ticket;
    let csrf_token = auth_response.data.csrf_token;

    // Start the VM
    let start_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/start",
        host, port, node, vmid
    );

    println!("Starting VM {} on node {}...", vmid, node);

    let start_response = client
        .post(&start_url)
        .header("CSRFPreventionToken", &csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to start VM: {}", e))?;

    if !start_response.status().is_success() {
        let status = start_response.status();
        let body = start_response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to start VM with status: {}. Response: {}",
            status, body
        ));
    }

    println!("VM start command sent successfully");

    Ok(())
}
