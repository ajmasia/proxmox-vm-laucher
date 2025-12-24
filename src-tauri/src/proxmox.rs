use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;

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
    #[serde(default)]
    pub tags: String,
    #[serde(default)]
    pub spice: bool,
    #[serde(default)]
    #[serde(rename = "ipAddress")]
    pub ip_address: Option<String>,
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

#[derive(Debug, Deserialize)]
struct VMConfigResponse {
    data: VMConfig,
}

#[derive(Debug, Deserialize)]
struct TaskResponse {
    data: String, // UPID string
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskStatus {
    pub status: String,      // "running" or "stopped"
    #[serde(default)]
    pub exitstatus: String,  // "OK" or error message (only when stopped)
    #[serde(default)]
    pub node: String,
    #[serde(rename = "type")]
    #[serde(default)]
    pub task_type: String,
}

#[derive(Debug, Deserialize)]
struct TaskStatusResponse {
    data: TaskStatus,
}

#[derive(Debug, Deserialize)]
struct VMConfig {
    #[serde(default)]
    vga: String,
    #[serde(default = "default_cores")]
    cores: u32,
    #[serde(default = "default_sockets")]
    sockets: u32,
}

fn default_cores() -> u32 {
    1
}

fn default_sockets() -> u32 {
    1
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

// Get VM IP address from QEMU Guest Agent
async fn get_vm_ip(
    client: &reqwest::Client,
    host: &str,
    port: u16,
    ticket: &str,
    node: &str,
    vmid: u32,
) -> Option<String> {
    #[derive(Deserialize)]
    struct NetworkResponse {
        data: Option<NetworkData>,
    }

    #[derive(Deserialize)]
    struct NetworkData {
        result: Option<Vec<NetworkInterface>>,
    }

    #[derive(Deserialize)]
    struct NetworkInterface {
        name: String,
        #[serde(rename = "ip-addresses")]
        ip_addresses: Option<Vec<IpAddress>>,
    }

    #[derive(Deserialize)]
    struct IpAddress {
        #[serde(rename = "ip-address")]
        ip_address: String,
        #[serde(rename = "ip-address-type")]
        ip_address_type: String,
    }

    let url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/agent/network-get-interfaces",
        host, port, node, vmid
    );

    let response = client
        .get(&url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .ok()?;

    if !response.status().is_success() {
        return None;
    }

    let network_data: NetworkResponse = response.json().await.ok()?;
    let result = network_data.data?.result?;

    // Find the first non-loopback IPv4 address
    for interface in result {
        // Skip loopback interface
        if interface.name == "lo" {
            continue;
        }

        if let Some(addresses) = interface.ip_addresses {
            for addr in addresses {
                // Only get IPv4 addresses (skip 127.x.x.x)
                if addr.ip_address_type == "ipv4" && !addr.ip_address.starts_with("127.") {
                    return Some(addr.ip_address);
                }
            }
        }
    }

    None
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
    let mut vms_only: Vec<VMInfo> = vm_list
        .data
        .into_iter()
        .filter(|vm| vm.vm_type == "qemu")
        .collect();

    // Check SPICE configuration for each VM
    for vm in &mut vms_only {
        let config_url = format!(
            "https://{}:{}/api2/json/nodes/{}/qemu/{}/config",
            host, port, vm.node, vm.vmid
        );

        match client
            .get(&config_url)
            .header("Cookie", format!("PVEAuthCookie={}", ticket))
            .send()
            .await
        {
            Ok(response) if response.status().is_success() => {
                if let Ok(config) = response.json::<VMConfigResponse>().await {
                    // Check if vga contains "qxl" which indicates SPICE support
                    vm.spice = config.data.vga.to_lowercase().contains("qxl");

                    // Set CPU count from config if not already set (for stopped VMs)
                    if vm.cpus == 0 {
                        vm.cpus = config.data.cores * config.data.sockets;
                    }
                }
            }
            _ => {
                // If we can't get the config, assume no SPICE
                vm.spice = false;
            }
        }

        // Get IP address for running VMs via QEMU Guest Agent
        if vm.status == "running" {
            vm.ip_address = get_vm_ip(&client, host, port, &ticket, &vm.node, vm.vmid).await;
        }
    }

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
) -> Result<String, String> {
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

    let task_response: TaskResponse = start_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task response: {}", e))?;

    println!("VM start task initiated: {}", task_response.data);

    Ok(task_response.data)
}

pub async fn stop_vm(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    vmid: u32,
) -> Result<String, String> {
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

    // Stop the VM
    let stop_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/stop",
        host, port, node, vmid
    );

    println!("Stopping VM {} on node {}...", vmid, node);

    let stop_response = client
        .post(&stop_url)
        .header("CSRFPreventionToken", &csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to stop VM: {}", e))?;

    if !stop_response.status().is_success() {
        let status = stop_response.status();
        let body = stop_response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to stop VM with status: {}. Response: {}",
            status, body
        ));
    }

    let task_response: TaskResponse = stop_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task response: {}", e))?;

    println!("VM stop task initiated: {}", task_response.data);

    Ok(task_response.data)
}

pub async fn resume_vm(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    vmid: u32,
) -> Result<String, String> {
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

    // Resume the VM
    let resume_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/resume",
        host, port, node, vmid
    );

    println!("Resuming VM {} on node {}...", vmid, node);

    let resume_response = client
        .post(&resume_url)
        .header("CSRFPreventionToken", &csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to resume VM: {}", e))?;

    if !resume_response.status().is_success() {
        let status = resume_response.status();
        let body = resume_response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to resume VM with status: {}. Response: {}",
            status, body
        ));
    }

    let task_response: TaskResponse = resume_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task response: {}", e))?;

    println!("VM resume task initiated: {}", task_response.data);

    Ok(task_response.data)
}

pub async fn suspend_vm(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    vmid: u32,
) -> Result<String, String> {
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

    // Suspend the VM
    let suspend_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/suspend",
        host, port, node, vmid
    );

    println!("Suspending VM {} on node {}...", vmid, node);

    let suspend_response = client
        .post(&suspend_url)
        .header("CSRFPreventionToken", &csrf_token)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to suspend VM: {}", e))?;

    if !suspend_response.status().is_success() {
        let status = suspend_response.status();
        let body = suspend_response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to suspend VM with status: {}. Response: {}",
            status, body
        ));
    }

    let task_response: TaskResponse = suspend_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task response: {}", e))?;

    println!("VM suspend task initiated: {}", task_response.data);

    Ok(task_response.data)
}

pub fn launch_spice_viewer(spice_config: &str) -> Result<(), String> {
    // Create temporary directory for SPICE config
    let temp_dir = std::env::temp_dir();
    let config_path = temp_dir.join(format!("spice-{}.vv", std::process::id()));

    println!("Saving SPICE config to: {:?}", config_path);

    // Save SPICE config to file
    fs::write(&config_path, spice_config)
        .map_err(|e| format!("Failed to write SPICE config file: {}", e))?;

    println!("Launching remote-viewer...");

    // Launch remote-viewer with the config file
    Command::new("remote-viewer")
        .arg(&config_path)
        .spawn()
        .map_err(|e| format!("Failed to launch remote-viewer: {}. Make sure 'remote-viewer' is installed.", e))?;

    println!("remote-viewer launched successfully");

    Ok(())
}

// Get cluster name
pub async fn get_cluster_name(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // First, authenticate
    let auth_url = format!("https://{}:{}/api2/json/access/ticket", host, port);
    let params = [("username", username), ("password", password)];

    let auth_response = client
        .post(&auth_url)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Authentication failed: {}", e))?;

    if !auth_response.status().is_success() {
        return Err(format!(
            "Authentication failed with status: {}",
            auth_response.status()
        ));
    }

    let auth_data: AuthResponse = auth_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse auth response: {}", e))?;

    // Get cluster status
    let cluster_url = format!("https://{}:{}/api2/json/cluster/status", host, port);

    let response = client
        .get(&cluster_url)
        .header(
            "Cookie",
            format!("PVEAuthCookie={}", auth_data.data.ticket),
        )
        .header("CSRFPreventionToken", &auth_data.data.csrf_token)
        .send()
        .await
        .map_err(|e| format!("Failed to get cluster status: {}", e))?;

    if !response.status().is_success() {
        // If cluster endpoint fails, try to get node name as fallback
        return get_node_name(host, port, &auth_data.data.ticket).await;
    }

    #[derive(Deserialize)]
    struct ClusterStatusResponse {
        data: Vec<ClusterNode>,
    }

    #[derive(Deserialize)]
    struct ClusterNode {
        #[serde(default)]
        name: String,
        #[serde(rename = "type")]
        node_type: String,
    }

    let cluster_status: ClusterStatusResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse cluster status: {}", e))?;

    // Find the cluster name (type "cluster")
    if let Some(cluster) = cluster_status.data.iter().find(|n| n.node_type == "cluster") {
        Ok(cluster.name.clone())
    } else {
        // Fallback to first node name
        get_node_name(host, port, &auth_data.data.ticket).await
    }
}

async fn get_node_name(host: &str, port: u16, ticket: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let nodes_url = format!("https://{}:{}/api2/json/nodes", host, port);

    let response = client
        .get(&nodes_url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to get nodes: {}", e))?;

    #[derive(Deserialize)]
    struct NodesResponse {
        data: Vec<Node>,
    }

    #[derive(Deserialize)]
    struct Node {
        node: String,
    }

    let nodes: NodesResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse nodes response: {}", e))?;

    Ok(nodes.data.first().map(|n| n.node.clone()).unwrap_or_else(|| host.to_string()))
}

/// Get the status of a Proxmox task by its UPID
pub async fn get_task_status(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    upid: &str,
) -> Result<TaskStatus, String> {
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

    // URL encode the UPID since it contains special characters
    let encoded_upid = urlencoding::encode(upid);

    // Get task status
    let task_url = format!(
        "https://{}:{}/api2/json/nodes/{}/tasks/{}/status",
        host, port, node, encoded_upid
    );

    println!("Checking task status: {}", upid);

    let task_response = client
        .get(&task_url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await
        .map_err(|e| format!("Failed to get task status: {}", e))?;

    if !task_response.status().is_success() {
        let status = task_response.status();
        let body = task_response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!(
            "Failed to get task status with status: {}. Response: {}",
            status, body
        ));
    }

    let status_response: TaskStatusResponse = task_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task status response: {}", e))?;

    println!("Task status: {:?}", status_response.data);

    Ok(status_response.data)
}
