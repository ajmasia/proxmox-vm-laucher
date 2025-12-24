use serde::{Deserialize, Serialize};

/// VM status enum for type-safe status handling
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VMStatus {
    Running,
    Stopped,
    Paused,
}

impl VMStatus {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "running" => VMStatus::Running,
            "paused" => VMStatus::Paused,
            _ => VMStatus::Stopped,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            VMStatus::Running => "running",
            VMStatus::Stopped => "stopped",
            VMStatus::Paused => "paused",
        }
    }
}

/// Complete VM information from Proxmox API
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VMInfo {
    pub vmid: u32,
    pub name: String,
    pub status: String,
    pub node: String,
    #[serde(rename = "type", default)]
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
    #[serde(rename = "ipAddress", default)]
    pub ip_address: Option<String>,
}

impl VMInfo {
    /// Get the parsed VM status
    pub fn get_status(&self) -> VMStatus {
        VMStatus::from_str(&self.status)
    }

    /// Get tags as a vector of strings
    pub fn get_tags(&self) -> Vec<String> {
        if self.tags.is_empty() {
            Vec::new()
        } else {
            self.tags.split(';').map(|s| s.to_string()).collect()
        }
    }

    /// Check if VM is running
    pub fn is_running(&self) -> bool {
        self.get_status() == VMStatus::Running
    }

    /// Check if VM is paused
    pub fn is_paused(&self) -> bool {
        self.get_status() == VMStatus::Paused
    }

    /// Check if VM is stopped
    pub fn is_stopped(&self) -> bool {
        self.get_status() == VMStatus::Stopped
    }
}
