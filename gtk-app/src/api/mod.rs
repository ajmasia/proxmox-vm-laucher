mod client;
mod error;
mod auth;
mod vms;
mod tasks;
mod spice;

pub use error::{ApiError, Result};
pub use auth::{authenticate, get_cluster_name};
pub use vms::{list_vms, start_vm, stop_vm, suspend_vm, resume_vm};
pub use tasks::get_task_status;
pub use spice::{get_spice_config, launch_spice_viewer};
