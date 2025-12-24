use serde::{Deserialize, Serialize};

/// Status of a Proxmox task (async operation)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskStatus {
    pub status: String,
    #[serde(default)]
    pub exitstatus: String,
    #[serde(default)]
    pub node: String,
    #[serde(rename = "type", default)]
    pub task_type: String,
}

impl TaskStatus {
    /// Check if task is still running
    pub fn is_running(&self) -> bool {
        self.status == "running"
    }

    /// Check if task completed successfully
    pub fn is_success(&self) -> bool {
        self.status == "stopped" && self.exitstatus == "OK"
    }

    /// Check if task failed
    pub fn is_failed(&self) -> bool {
        self.status == "stopped" && self.exitstatus != "OK"
    }

    /// Get error message if task failed
    pub fn error_message(&self) -> Option<&str> {
        if self.is_failed() {
            Some(&self.exitstatus)
        } else {
            None
        }
    }
}
