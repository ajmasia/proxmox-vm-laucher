use serde::Deserialize;
use super::client::create_client;
use super::error::{ApiError, Result};
use crate::models::AuthTokens;

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

/// Authenticate with Proxmox server
pub async fn authenticate(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
) -> Result<AuthTokens> {
    let client = create_client()?;

    let url = format!("https://{}:{}/api2/json/access/ticket", host, port);
    let params = [("username", username), ("password", password)];

    let response = client.post(&url).form(&params).send().await?;

    if !response.status().is_success() {
        return Err(ApiError::Auth(format!(
            "Authentication failed with status: {}",
            response.status()
        )));
    }

    let auth_response: AuthResponse = response.json().await?;

    Ok(AuthTokens {
        ticket: auth_response.data.ticket,
        csrf_token: auth_response.data.csrf_token,
    })
}

#[derive(Debug, Deserialize)]
struct ClusterStatusResponse {
    data: Vec<ClusterNode>,
}

#[derive(Debug, Deserialize)]
struct ClusterNode {
    #[serde(default)]
    name: String,
    #[serde(rename = "type")]
    node_type: String,
}

#[derive(Debug, Deserialize)]
struct NodesResponse {
    data: Vec<Node>,
}

#[derive(Debug, Deserialize)]
struct Node {
    node: String,
}

/// Get cluster name or node name as fallback
pub async fn get_cluster_name(
    host: &str,
    port: u16,
    username: &str,
    password: &str,
) -> Result<String> {
    let client = create_client()?;

    // First, authenticate
    let tokens = authenticate(host, port, username, password).await?;

    // Get cluster status
    let cluster_url = format!("https://{}:{}/api2/json/cluster/status", host, port);

    let response = client
        .get(&cluster_url)
        .header("Cookie", format!("PVEAuthCookie={}", tokens.ticket))
        .send()
        .await?;

    if response.status().is_success() {
        if let Ok(cluster_status) = response.json::<ClusterStatusResponse>().await {
            // Find the cluster name (type "cluster")
            if let Some(cluster) = cluster_status.data.iter().find(|n| n.node_type == "cluster") {
                return Ok(cluster.name.clone());
            }
        }
    }

    // Fallback to first node name
    get_node_name(host, port, &tokens.ticket).await
}

async fn get_node_name(host: &str, port: u16, ticket: &str) -> Result<String> {
    let client = create_client()?;

    let nodes_url = format!("https://{}:{}/api2/json/nodes", host, port);

    let response = client
        .get(&nodes_url)
        .header("Cookie", format!("PVEAuthCookie={}", ticket))
        .send()
        .await?;

    let nodes: NodesResponse = response.json().await?;

    Ok(nodes
        .data
        .first()
        .map(|n| n.node.clone())
        .unwrap_or_else(|| host.to_string()))
}
