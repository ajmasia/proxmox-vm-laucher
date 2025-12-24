use thiserror::Error;

/// API errors
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("HTTP client error: {0}")]
    Client(#[from] reqwest::Error),

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("JSON parse error: {0}")]
    Parse(#[from] serde_json::Error),

    #[error("API error ({status}): {message}")]
    Api { status: u16, message: String },

    #[error("VM not found: {0}")]
    VMNotFound(String),

    #[error("Task failed: {0}")]
    TaskFailed(String),

    #[error("SPICE error: {0}")]
    Spice(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, ApiError>;
