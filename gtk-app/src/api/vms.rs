use serde::Deserialize;
use super::client::create_client;
use super::error::{ApiError, Result};
use crate::models::VMInfo;

#[derive(Debug, Deserialize)]
struct VMListResponse {
    data: Vec<VMInfo>,
}

#[derive(Debug, Deserialize)]
struct VMConfigResponse {
    data: VMConfig,
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

fn default_cores() -> u32 { 1 }
fn default_sockets() -> u32 { 1 }

#[derive(Debug, Deserialize)]
struct TaskResponse {
    data: String,
}

// Network interface structs for IP address resolution
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

/// Get VM IP address from QEMU Guest Agent
async fn get_vm_ip(
    client: &reqwest::Client,
    host: &str,
    port: u16,
    ticket: &str,
    node: &str,
    vmid: u32,
) -> Option<String> {
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
        if interface.name == "lo" {
            continue;
        }

        if let Some(addresses) = interface.ip_addresses {
            for addr in addresses {
                if addr.ip_address_type == "ipv4" && !addr.ip_address.starts_with("127.") {
                    return Some(addr.ip_address);
                }
            }
        }
    }

    None
}

/// List all VMs from Proxmox cluster
pub async fn list_vms(
    host: &str,
    port: u16,
    ticket: &str,
    _csrf: &str,
) -> Result<Vec<VMInfo>> {
    let client = create_client()?;

    // Get list of resources (VMs across all nodes)
    let resources_url = format!("https://{}:{}/api2/json/cluster/resources?type=vm", host, port);

    let vm_response = client
        .get(&resources_url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    if !vm_response.status().is_success() {
        let status = vm_response.status();
        let body = vm_response.text().await.unwrap_or_default();
        return Err(ApiError::Api {
            status: status.as_u16(),
            message: body,
        });
    }

    let vm_list: VMListResponse = vm_response.json().await?;

    // Filter only VMs (exclude LXC containers)
    let mut vms_only: Vec<VMInfo> = vm_list
        .data
        .into_iter()
        .filter(|vm| vm.vm_type == "qemu")
        .collect();

    // Check SPICE configuration and get IP for each VM
    for vm in &mut vms_only {
        let config_url = format!(
            "https://{}:{}/api2/json/nodes/{}/qemu/{}/config",
            host, port, vm.node, vm.vmid
        );

        if let Ok(response) = client
            .get(&config_url)
            .header("Cookie", format!("PVEAuthCookie={}", ticket))
            .send()
            .await
        {
            if response.status().is_success() {
                if let Ok(config) = response.json::<VMConfigResponse>().await {
                    vm.spice = config.data.vga.to_lowercase().contains("qxl");
                    if vm.cpus == 0 {
                        vm.cpus = config.data.cores * config.data.sockets;
                    }
                }
            }
        }

        // Get IP address for running VMs
        if vm.status == "running" {
            vm.ip_address = get_vm_ip(&client, host, port, ticket, &vm.node, vm.vmid).await;
        }
    }

    Ok(vms_only)
}

/// Start a VM
pub async fn start_vm(
    host: &str,
    port: u16,
    ticket: &str,
    csrf: &str,
    node: &str,
    vmid: u32,
) -> Result<String> {
    let client = create_client()?;

    let start_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/start",
        host, port, node, vmid
    );

    let response = client
        .post(&start_url)
        .header("CSRFPreventionToken", csrf)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Api {
            status: status.as_u16(),
            message: body,
        });
    }

    let task: TaskResponse = response.json().await?;
    Ok(task.data)
}

/// Stop a VM
pub async fn stop_vm(
    host: &str,
    port: u16,
    ticket: &str,
    csrf: &str,
    node: &str,
    vmid: u32,
) -> Result<String> {
    let client = create_client()?;

    let stop_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/stop",
        host, port, node, vmid
    );

    let response = client
        .post(&stop_url)
        .header("CSRFPreventionToken", csrf)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Api {
            status: status.as_u16(),
            message: body,
        });
    }

    let task: TaskResponse = response.json().await?;
    Ok(task.data)
}

/// Suspend (pause) a VM
pub async fn suspend_vm(
    host: &str,
    port: u16,
    ticket: &str,
    csrf: &str,
    node: &str,
    vmid: u32,
) -> Result<String> {
    let client = create_client()?;

    let suspend_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/suspend",
        host, port, node, vmid
    );

    let response = client
        .post(&suspend_url)
        .header("CSRFPreventionToken", csrf)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Api {
            status: status.as_u16(),
            message: body,
        });
    }

    let task: TaskResponse = response.json().await?;
    Ok(task.data)
}

/// Resume a paused VM
pub async fn resume_vm(
    host: &str,
    port: u16,
    ticket: &str,
    csrf: &str,
    node: &str,
    vmid: u32,
) -> Result<String> {
    let client = create_client()?;

    let resume_url = format!(
        "https://{}:{}/api2/json/nodes/{}/qemu/{}/status/resume",
        host, port, node, vmid
    );

    let response = client
        .post(&resume_url)
        .header("CSRFPreventionToken", csrf)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Api {
            status: status.as_u16(),
            message: body,
        });
    }

    let task: TaskResponse = response.json().await?;
    Ok(task.data)
}
