use libadwaita as adw;
use libadwaita::prelude::*;
use relm4::prelude::*;
use relm4::gtk;

use crate::api;
use crate::models::{AuthTokens, ServerConfig, Session};
use crate::utils;

/// Login page mode
#[derive(Debug, Clone, PartialEq)]
enum LoginMode {
    /// No servers - show empty state
    Empty,
    /// Adding a new server
    AddServer,
    /// Select from saved servers and login
    Login,
}

/// Login page state
pub struct LoginPage {
    mode: LoginMode,
    // Saved servers
    servers: Vec<ServerConfig>,
    selected_server_idx: Option<usize>,
    // New server form fields
    new_name: String,
    new_host: String,
    new_port: String,
    new_username: String,
    // Password (for login)
    password: String,
    // State
    is_loading: bool,
    error: Option<String>,
    // Track if server list needs refresh
    servers_changed: bool,
}

/// Login page messages
#[derive(Debug)]
pub enum LoginMsg {
    // Server selection
    SelectServer(u32),
    // New server form
    SetNewName(String),
    SetNewHost(String),
    SetNewPort(String),
    SetNewUsername(String),
    // Password
    SetPassword(String),
    // Actions
    ShowAddServer,
    SaveServer,
    CancelAddServer,
    DeleteServer,
    Login,
    LoginSuccess(AuthTokens, Option<String>),
    LoginError(String),
}

/// Login page output (sent to parent)
#[derive(Debug)]
pub enum LoginOutput {
    LoggedIn(Session),
}

#[relm4::component(pub)]
impl SimpleComponent for LoginPage {
    type Init = ();
    type Input = LoginMsg;
    type Output = LoginOutput;

    view! {
        adw::ApplicationWindow {
            set_title: Some("PVE Launcher"),
            set_default_size: (450, 600),

            #[wrap(Some)]
            set_content = &gtk::Box {
                set_orientation: gtk::Orientation::Vertical,

                adw::HeaderBar {
                    pack_start = &gtk::Button {
                        set_icon_name: "go-previous-symbolic",
                        set_tooltip_text: Some("Back"),
                        #[watch]
                        set_visible: model.mode == LoginMode::AddServer && !model.servers.is_empty(),
                        connect_clicked => LoginMsg::CancelAddServer,
                    },

                    pack_start = &gtk::Button {
                        set_icon_name: "list-add-symbolic",
                        set_tooltip_text: Some("Add server"),
                        #[watch]
                        set_visible: model.mode == LoginMode::Login,
                        connect_clicked => LoginMsg::ShowAddServer,
                    },

                    pack_end = &gtk::Button {
                        set_icon_name: "user-trash-symbolic",
                        set_tooltip_text: Some("Delete server"),
                        #[watch]
                        set_visible: model.mode == LoginMode::Login && model.selected_server_idx.is_some(),
                        connect_clicked => LoginMsg::DeleteServer,
                    },
                },

                gtk::ScrolledWindow {
                    set_vexpand: true,
                    set_hscrollbar_policy: gtk::PolicyType::Never,

                    adw::Clamp {
                        set_maximum_size: 400,
                        set_margin_all: 24,

                        #[wrap(Some)]
                        set_child = &gtk::Box {
                            set_orientation: gtk::Orientation::Vertical,
                            set_spacing: 24,
                            set_valign: gtk::Align::Center,

                            // Logo and title
                            gtk::Box {
                                set_orientation: gtk::Orientation::Vertical,
                                set_spacing: 12,
                                set_halign: gtk::Align::Center,

                                gtk::Image {
                                    set_icon_name: Some("computer-symbolic"),
                                    set_pixel_size: 64,
                                    add_css_class: "dim-label",
                                },

                                gtk::Label {
                                    set_label: "PVE Launcher",
                                    add_css_class: "title-1",
                                },

                                gtk::Label {
                                    #[watch]
                                    set_label: match model.mode {
                                        LoginMode::Empty => "No servers configured",
                                        LoginMode::AddServer => "Add a new server",
                                        LoginMode::Login => "Connect to server",
                                    },
                                    add_css_class: "dim-label",
                                },
                            },

                            // Empty state - Add Server button
                            #[name = "empty_box"]
                            gtk::Box {
                                set_orientation: gtk::Orientation::Vertical,
                                set_spacing: 16,
                                set_halign: gtk::Align::Center,
                                #[watch]
                                set_visible: model.mode == LoginMode::Empty,

                                gtk::Button {
                                    set_label: "Add Server",
                                    add_css_class: "pill",
                                    set_height_request: 42,
                                    connect_clicked => LoginMsg::ShowAddServer,
                                },
                            },

                            // Add server form
                            #[name = "add_server_box"]
                            gtk::Box {
                                set_orientation: gtk::Orientation::Vertical,
                                set_spacing: 16,
                                #[watch]
                                set_visible: model.mode == LoginMode::AddServer,

                                gtk::ListBox {
                                    add_css_class: "boxed-list",
                                    set_selection_mode: gtk::SelectionMode::None,

                                    adw::ActionRow {
                                        set_title: "Name",
                                        set_subtitle: "A friendly name for this server",
                                        add_suffix = &gtk::Entry {
                                            set_valign: gtk::Align::Center,
                                            set_placeholder_text: Some("My Proxmox"),
                                            connect_changed[sender] => move |e| {
                                                sender.input(LoginMsg::SetNewName(e.text().to_string()));
                                            },
                                        },
                                    },

                                    adw::ActionRow {
                                        set_title: "Host",
                                        set_subtitle: "IP address or hostname",
                                        add_suffix = &gtk::Entry {
                                            set_valign: gtk::Align::Center,
                                            set_placeholder_text: Some("192.168.1.100"),
                                            connect_changed[sender] => move |e| {
                                                sender.input(LoginMsg::SetNewHost(e.text().to_string()));
                                            },
                                        },
                                    },

                                    adw::ActionRow {
                                        set_title: "Port",
                                        add_suffix = &gtk::Entry {
                                            set_valign: gtk::Align::Center,
                                            set_placeholder_text: Some("8006"),
                                            set_width_chars: 6,
                                            connect_changed[sender] => move |e| {
                                                sender.input(LoginMsg::SetNewPort(e.text().to_string()));
                                            },
                                        },
                                    },

                                    adw::ActionRow {
                                        set_title: "Username",
                                        add_suffix = &gtk::Entry {
                                            set_valign: gtk::Align::Center,
                                            set_placeholder_text: Some("root@pam"),
                                            connect_changed[sender] => move |e| {
                                                sender.input(LoginMsg::SetNewUsername(e.text().to_string()));
                                            },
                                        },
                                    },
                                },

                                // Save button
                                gtk::Button {
                                    set_label: "Save Server",
                                    add_css_class: "pill",
                                    set_height_request: 42,
                                    #[watch]
                                    set_sensitive: model.can_save_server(),
                                    connect_clicked => LoginMsg::SaveServer,
                                },
                            },

                            // Login form (server selector + password)
                            #[name = "login_box"]
                            gtk::Box {
                                set_orientation: gtk::Orientation::Vertical,
                                set_spacing: 16,
                                #[watch]
                                set_visible: model.mode == LoginMode::Login,

                                // Server selector
                                #[name = "server_listbox"]
                                gtk::ListBox {
                                    add_css_class: "boxed-list",
                                    set_selection_mode: gtk::SelectionMode::Single,
                                    connect_row_selected[sender] => move |_, row| {
                                        if let Some(row) = row {
                                            sender.input(LoginMsg::SelectServer(row.index() as u32));
                                        }
                                    },
                                },

                                // Password
                                gtk::ListBox {
                                    add_css_class: "boxed-list",
                                    set_selection_mode: gtk::SelectionMode::None,

                                    adw::ActionRow {
                                        set_title: "Password",
                                        add_suffix = &gtk::PasswordEntry {
                                            set_valign: gtk::Align::Center,
                                            set_show_peek_icon: true,
                                            connect_changed[sender] => move |e| {
                                                sender.input(LoginMsg::SetPassword(e.text().to_string()));
                                            },
                                            connect_activate[sender] => move |_| {
                                                sender.input(LoginMsg::Login);
                                            },
                                        },
                                    },
                                },

                                // Error message
                                gtk::Revealer {
                                    #[watch]
                                    set_reveal_child: model.error.is_some(),
                                    set_transition_type: gtk::RevealerTransitionType::SlideDown,

                                    gtk::Box {
                                        set_orientation: gtk::Orientation::Horizontal,
                                        set_spacing: 12,
                                        set_margin_top: 8,
                                        set_margin_bottom: 8,
                                        set_margin_start: 16,
                                        set_margin_end: 16,
                                        add_css_class: "background",
                                        add_css_class: "frame",

                                        gtk::Image {
                                            set_icon_name: Some("dialog-warning-symbolic"),
                                            set_valign: gtk::Align::Center,
                                            add_css_class: "warning",
                                        },

                                        gtk::Label {
                                            #[watch]
                                            set_label: model.error.as_deref().unwrap_or(""),
                                            set_wrap: true,
                                            set_xalign: 0.0,
                                            set_hexpand: true,
                                            set_valign: gtk::Align::Center,
                                        },
                                    },
                                },

                                // Connect button
                                gtk::Button {
                                    add_css_class: "pill",
                                    set_height_request: 42,
                                    #[watch]
                                    set_sensitive: !model.is_loading && model.can_login(),
                                    connect_clicked => LoginMsg::Login,

                                    gtk::Box {
                                        set_spacing: 8,
                                        set_halign: gtk::Align::Center,

                                        gtk::Spinner {
                                            #[watch]
                                            set_visible: model.is_loading,
                                            #[watch]
                                            set_spinning: model.is_loading,
                                        },

                                        gtk::Label {
                                            #[watch]
                                            set_label: if model.is_loading { "Connecting..." } else { "Connect" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    }

    fn init(
        _init: Self::Init,
        root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        let _ = &sender;

        // Load saved servers
        let config = utils::load_config();
        let servers = config.servers;

        // Determine initial mode
        let mode = if servers.is_empty() {
            LoginMode::Empty
        } else {
            LoginMode::Login
        };

        // Select last used server if available
        let selected_server_idx = if !servers.is_empty() {
            config
                .last_used_server_id
                .and_then(|id| servers.iter().position(|s| s.id == id))
                .or(Some(0))
        } else {
            None
        };

        let model = LoginPage {
            mode,
            servers,
            selected_server_idx,
            new_name: String::new(),
            new_host: String::new(),
            new_port: String::from("8006"),
            new_username: String::from("root@pam"),
            password: String::new(),
            is_loading: false,
            error: None,
            servers_changed: true, // Trigger initial population
        };

        let widgets = view_output!();

        ComponentParts { model, widgets }
    }

    fn pre_view() {
        // Refresh server list when needed
        if model.servers_changed && model.mode == LoginMode::Login {
            refresh_server_list(&widgets.server_listbox, &model.servers, model.selected_server_idx);
        }
    }

    fn update(&mut self, msg: Self::Input, sender: ComponentSender<Self>) {
        match msg {
            LoginMsg::SelectServer(idx) => {
                self.selected_server_idx = Some(idx as usize);
                self.error = None;
            }
            LoginMsg::SetNewName(name) => {
                self.new_name = name;
            }
            LoginMsg::SetNewHost(host) => {
                self.new_host = host;
            }
            LoginMsg::SetNewPort(port) => {
                self.new_port = port;
            }
            LoginMsg::SetNewUsername(username) => {
                self.new_username = username;
            }
            LoginMsg::SetPassword(password) => {
                self.password = password;
                self.error = None;
            }
            LoginMsg::ShowAddServer => {
                self.mode = LoginMode::AddServer;
                self.new_name.clear();
                self.new_host.clear();
                self.new_port = String::from("8006");
                self.new_username = String::from("root@pam");
                self.error = None;
            }
            LoginMsg::SaveServer => {
                if !self.can_save_server() {
                    return;
                }

                // Create and save new server
                let server = ServerConfig::new(
                    uuid::Uuid::new_v4().to_string(),
                    if self.new_name.is_empty() {
                        self.new_host.clone()
                    } else {
                        self.new_name.clone()
                    },
                    self.new_host.clone(),
                    self.new_port.parse().unwrap_or(8006),
                    self.new_username.clone(),
                );

                if let Err(e) = utils::add_server(server.clone()) {
                    self.error = Some(e);
                    return;
                }

                // Add to local list and switch to login mode
                self.servers.push(server);
                self.selected_server_idx = Some(self.servers.len() - 1);
                self.mode = LoginMode::Login;
                self.password.clear();
                self.servers_changed = true;
            }
            LoginMsg::CancelAddServer => {
                if self.servers.is_empty() {
                    self.mode = LoginMode::Empty;
                } else {
                    self.mode = LoginMode::Login;
                    self.servers_changed = true;
                }
                self.error = None;
            }
            LoginMsg::DeleteServer => {
                if let Some(idx) = self.selected_server_idx {
                    if let Some(server) = self.servers.get(idx) {
                        let _ = utils::delete_server(&server.id);
                        self.servers.remove(idx);

                        if self.servers.is_empty() {
                            self.mode = LoginMode::Empty;
                            self.selected_server_idx = None;
                        } else {
                            self.selected_server_idx = Some(0);
                            self.servers_changed = true;
                        }
                    }
                }
            }
            LoginMsg::Login => {
                if !self.can_login() {
                    return;
                }

                self.is_loading = true;
                self.error = None;

                let server = self.servers[self.selected_server_idx.unwrap()].clone();
                let password = self.password.clone();

                relm4::spawn(async move {
                    match api::authenticate(&server.host, server.port, &server.username, &password).await {
                        Ok(tokens) => {
                            let _ = utils::set_last_used_server(&server.id);

                            let cluster_name = api::get_cluster_name(
                                &server.host,
                                server.port,
                                &server.username,
                                &password,
                            )
                            .await
                            .ok();

                            sender.input(LoginMsg::LoginSuccess(tokens, cluster_name));
                        }
                        Err(e) => {
                            sender.input(LoginMsg::LoginError(e.to_string()));
                        }
                    }
                });
            }
            LoginMsg::LoginSuccess(tokens, cluster_name) => {
                self.is_loading = false;

                let server = self.servers[self.selected_server_idx.unwrap()].clone();
                let session = Session::new(server, self.password.clone(), tokens, cluster_name);

                let _ = sender.output(LoginOutput::LoggedIn(session));
            }
            LoginMsg::LoginError(error) => {
                self.is_loading = false;
                self.error = Some(error);
            }
        }
    }
}

impl LoginPage {
    fn can_save_server(&self) -> bool {
        !self.new_host.is_empty() && !self.new_username.is_empty()
    }

    fn can_login(&self) -> bool {
        self.selected_server_idx.is_some() && !self.password.is_empty()
    }
}

/// Helper to refresh server list (visual only, no selection signals)
fn refresh_server_list(listbox: &gtk::ListBox, servers: &[ServerConfig], selected_idx: Option<usize>) {
    // Clear existing rows
    while let Some(row) = listbox.first_child() {
        listbox.remove(&row);
    }

    // Add server rows with visual selection indicator
    for (idx, server) in servers.iter().enumerate() {
        let row = adw::ActionRow::builder()
            .title(&server.name)
            .subtitle(&format!("{}@{}:{}", server.username, server.host, server.port))
            .activatable(true)
            .build();

        // Add checkmark icon for selected server
        if Some(idx) == selected_idx {
            let check = gtk::Image::from_icon_name("object-select-symbolic");
            row.add_prefix(&check);
        }

        listbox.append(&row);
    }
}
