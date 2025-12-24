use serde::{Deserialize, Serialize};

/// Server configuration (without password)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
}

impl ServerConfig {
    pub fn new(id: String, name: String, host: String, port: u16, username: String) -> Self {
        Self {
            id,
            name,
            host,
            port,
            username,
        }
    }

    /// Create a display string for the server
    pub fn display_name(&self) -> String {
        format!("{} ({}@{}:{})", self.name, self.username, self.host, self.port)
    }
}

/// Authentication tokens from Proxmox API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthTokens {
    pub ticket: String,
    pub csrf_token: String,
}

/// Active session with server and tokens
#[derive(Debug, Clone)]
pub struct Session {
    pub server: ServerConfig,
    pub password: String,
    pub tokens: AuthTokens,
    pub cluster_name: Option<String>,
}

impl Session {
    pub fn new(
        server: ServerConfig,
        password: String,
        tokens: AuthTokens,
        cluster_name: Option<String>,
    ) -> Self {
        Self {
            server,
            password,
            tokens,
            cluster_name,
        }
    }

    /// Get the host for API calls
    pub fn host(&self) -> &str {
        &self.server.host
    }

    /// Get the port for API calls
    pub fn port(&self) -> u16 {
        self.server.port
    }

    /// Get the username for API calls
    pub fn username(&self) -> &str {
        &self.server.username
    }

    /// Get display name for the connection
    pub fn display_name(&self) -> String {
        self.cluster_name
            .clone()
            .unwrap_or_else(|| self.server.name.clone())
    }
}

/// Legacy connection struct for compatibility with existing API functions
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProxmoxConnection {
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub node: String,
    pub vmid: String,
}

impl ProxmoxConnection {
    /// Create from session with specific VM details
    pub fn from_session(session: &Session, node: &str, vmid: u32) -> Self {
        Self {
            name: session.server.name.clone(),
            host: session.server.host.clone(),
            port: session.server.port,
            username: session.server.username.clone(),
            password: session.password.clone(),
            node: node.to_string(),
            vmid: vmid.to_string(),
        }
    }
}
