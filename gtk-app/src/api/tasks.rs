use serde::Deserialize;
use super::auth::authenticate;
use super::client::create_client;
use super::error::Result;
use crate::models::TaskStatus;

#[derive(Debug, Deserialize)]
struct TaskStatusResponse {
    data: TaskStatus,
}

/// Get the status of a Proxmox task by its UPID
pub async fn get_task_status(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
    node: &str,
    upid: &str,
) -> Result<TaskStatus> {
    let client = create_client()?;
    let tokens = authenticate(host, port, username, password).await?;

    // URL encode the UPID since it contains special characters
    let encoded_upid = urlencoding::encode(upid);

    let task_url = format!(
        "https://{}:{}/api2/json/nodes/{}/tasks/{}/status",
        host, port, node, encoded_upid
    );

    let response = client
        .get(&task_url)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .send()
        .await?;

    let status_response: TaskStatusResponse = response.json().await?;
    Ok(status_response.data)
}
