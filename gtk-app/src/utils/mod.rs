pub mod config;

pub use config::{
    load_config, save_config, add_server, update_server,
    delete_server, set_last_used_server, get_last_used_server,
    StoredConfig,
};
