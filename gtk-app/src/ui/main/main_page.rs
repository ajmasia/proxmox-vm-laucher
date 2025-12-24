use std::collections::HashSet;

use libadwaita as adw;
use libadwaita::prelude::*;
use relm4::factory::FactoryVecDeque;
use relm4::prelude::*;
use relm4::gtk;

use crate::api;
use crate::models::Session;
use super::vm_item::{VMItem, VMItemInput, VMItemOutput};

/// Main page state
pub struct MainPage {
    session: Session,
    vms: FactoryVecDeque<VMItem>,
    is_loading: bool,
    error: Option<String>,
    operating_vms: HashSet<u32>,
    toast_message: Option<String>,
}

/// Main page messages
#[derive(Debug)]
pub enum MainMsg {
    // VM list
    LoadVMs,
    VMsLoaded(Vec<crate::models::VMInfo>),
    LoadError(String),
    // VM operations (from factory items)
    StartVM(u32, String),
    StopVM(u32, String),
    ConnectVM(u32, String),
    // VM operation results
    VMOperationStarted(u32),
    VMOperationComplete(u32, String),
    VMOperationError(u32, String),
    // Toast
    ShowToast(String),
    // Navigation
    Logout,
}

/// Main page output
#[derive(Debug)]
pub enum MainOutput {
    Logout,
}

#[relm4::component(pub)]
impl SimpleComponent for MainPage {
    type Init = Session;
    type Input = MainMsg;
    type Output = MainOutput;

    view! {
        adw::ApplicationWindow {
            set_title: Some("PVE Launcher"),
            set_default_size: (500, 700),

            #[wrap(Some)]
            #[name = "toast_overlay"]
            set_content = &adw::ToastOverlay {
                #[wrap(Some)]
                set_child = &gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,

                    adw::HeaderBar {
                        #[wrap(Some)]
                        set_title_widget = &gtk::Label {
                            #[watch]
                            set_label: &model.session.server.name,
                            add_css_class: "heading",
                        },

                        pack_start = &gtk::Button {
                            set_icon_name: "system-log-out-symbolic",
                            set_tooltip_text: Some("Logout"),
                            connect_clicked => MainMsg::Logout,
                        },

                        pack_end = &gtk::Button {
                            set_icon_name: "view-refresh-symbolic",
                            set_tooltip_text: Some("Refresh"),
                            #[watch]
                            set_sensitive: !model.is_loading,
                            connect_clicked => MainMsg::LoadVMs,
                        },
                    },

                    // Loading indicator
                    gtk::Box {
                        set_orientation: gtk::Orientation::Vertical,
                        set_valign: gtk::Align::Center,
                        set_vexpand: true,
                        set_spacing: 12,
                        #[watch]
                        set_visible: model.is_loading && model.vms.is_empty(),

                        gtk::Spinner {
                            set_spinning: true,
                            set_height_request: 32,
                        },

                        gtk::Label {
                            set_label: "Loading virtual machines...",
                            add_css_class: "dim-label",
                        },
                    },

                    // Error state
                    adw::StatusPage {
                        set_icon_name: Some("dialog-error-symbolic"),
                        set_title: "Error loading VMs",
                        #[watch]
                        set_description: model.error.as_deref(),
                        #[watch]
                        set_visible: model.error.is_some() && model.vms.is_empty(),

                        #[wrap(Some)]
                        set_child = &gtk::Button {
                            set_label: "Retry",
                            set_halign: gtk::Align::Center,
                            add_css_class: "pill",
                            connect_clicked => MainMsg::LoadVMs,
                        },
                    },

                    // Empty state
                    adw::StatusPage {
                        set_icon_name: Some("computer-symbolic"),
                        set_title: "No Virtual Machines",
                        set_description: Some("No VMs found on this server"),
                        #[watch]
                        set_visible: !model.is_loading && model.error.is_none() && model.vms.is_empty(),
                    },

                    // VM List
                    gtk::ScrolledWindow {
                        set_vexpand: true,
                        set_hscrollbar_policy: gtk::PolicyType::Never,
                        #[watch]
                        set_visible: !model.vms.is_empty(),

                        adw::Clamp {
                            set_maximum_size: 600,
                            set_margin_all: 12,

                            #[wrap(Some)]
                            set_child = &gtk::Box {
                                set_orientation: gtk::Orientation::Vertical,
                                set_spacing: 12,

                                gtk::Label {
                                    set_label: "Virtual Machines",
                                    set_xalign: 0.0,
                                    add_css_class: "heading",
                                    set_margin_start: 6,
                                },

                                #[local_ref]
                                vm_list -> gtk::ListBox {
                                    add_css_class: "boxed-list",
                                    set_selection_mode: gtk::SelectionMode::None,
                                },
                            },
                        },
                    },
                },
            },
        }
    }

    fn init(
        session: Self::Init,
        root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        // Create factory for VM items
        let vms = FactoryVecDeque::builder()
            .launch(gtk::ListBox::default())
            .forward(sender.input_sender(), |output| match output {
                VMItemOutput::Start(vmid, node) => MainMsg::StartVM(vmid, node),
                VMItemOutput::Stop(vmid, node) => MainMsg::StopVM(vmid, node),
                VMItemOutput::Connect(vmid, node) => MainMsg::ConnectVM(vmid, node),
            });

        let model = MainPage {
            session,
            vms,
            is_loading: true,
            error: None,
            operating_vms: HashSet::new(),
            toast_message: None,
        };

        let vm_list = model.vms.widget();
        let widgets = view_output!();

        // Show the window explicitly (needed when launched as child controller)
        root.present();

        // Trigger initial VM load
        sender.input(MainMsg::LoadVMs);

        ComponentParts { model, widgets }
    }

    fn pre_view() {
        if let Some(message) = &model.toast_message {
            widgets.toast_overlay.add_toast(adw::Toast::new(message));
        }
    }

    fn update(&mut self, msg: Self::Input, sender: ComponentSender<Self>) {
        // Clear toast message before processing new messages
        self.toast_message = None;
        match msg {
            MainMsg::LoadVMs => {
                self.is_loading = true;
                self.error = None;

                let host = self.session.server.host.clone();
                let port = self.session.server.port;
                let ticket = self.session.tokens.ticket.clone();
                let csrf = self.session.tokens.csrf_token.clone();

                relm4::spawn(async move {
                    match api::list_vms(&host, port, &ticket, &csrf).await {
                        Ok(vms) => {
                            sender.input(MainMsg::VMsLoaded(vms));
                        }
                        Err(e) => {
                            sender.input(MainMsg::LoadError(e.to_string()));
                        }
                    }
                });
            }
            MainMsg::VMsLoaded(vms) => {
                self.is_loading = false;
                self.error = None;

                // Clear and repopulate the factory
                let mut guard = self.vms.guard();
                guard.clear();
                for vm in vms {
                    guard.push_back(vm);
                }
            }
            MainMsg::LoadError(error) => {
                self.is_loading = false;
                self.error = Some(error);
            }
            MainMsg::StartVM(vmid, node) => {
                if self.operating_vms.contains(&vmid) {
                    return;
                }

                self.operating_vms.insert(vmid);
                self.set_vm_operating(vmid, true);

                let host = self.session.server.host.clone();
                let port = self.session.server.port;
                let ticket = self.session.tokens.ticket.clone();
                let csrf = self.session.tokens.csrf_token.clone();

                relm4::spawn(async move {
                    match api::start_vm(&host, port, &ticket, &csrf, &node, vmid).await {
                        Ok(_task_id) => {
                            sender.input(MainMsg::VMOperationComplete(vmid, "started".to_string()));
                        }
                        Err(e) => {
                            sender.input(MainMsg::VMOperationError(vmid, e.to_string()));
                        }
                    }
                });
            }
            MainMsg::StopVM(vmid, node) => {
                if self.operating_vms.contains(&vmid) {
                    return;
                }

                self.operating_vms.insert(vmid);
                self.set_vm_operating(vmid, true);

                let host = self.session.server.host.clone();
                let port = self.session.server.port;
                let ticket = self.session.tokens.ticket.clone();
                let csrf = self.session.tokens.csrf_token.clone();

                relm4::spawn(async move {
                    match api::stop_vm(&host, port, &ticket, &csrf, &node, vmid).await {
                        Ok(_task_id) => {
                            sender.input(MainMsg::VMOperationComplete(vmid, "stopped".to_string()));
                        }
                        Err(e) => {
                            sender.input(MainMsg::VMOperationError(vmid, e.to_string()));
                        }
                    }
                });
            }
            MainMsg::VMOperationStarted(vmid) => {
                self.operating_vms.insert(vmid);
                self.set_vm_operating(vmid, true);
            }
            MainMsg::VMOperationComplete(vmid, action) => {
                self.operating_vms.remove(&vmid);
                self.set_vm_operating(vmid, false);
                sender.input(MainMsg::ShowToast(format!("VM {} {}", vmid, action)));
                // Reload VMs to get updated status
                sender.input(MainMsg::LoadVMs);
            }
            MainMsg::VMOperationError(vmid, error) => {
                self.operating_vms.remove(&vmid);
                self.set_vm_operating(vmid, false);
                sender.input(MainMsg::ShowToast(format!("Error: {}", error)));
            }
            MainMsg::ShowToast(message) => {
                self.toast_message = Some(message);
            }
            MainMsg::ConnectVM(vmid, node) => {
                println!("Connect VM {} on {}", vmid, node);
                // TODO: Implement in Phase 6
            }
            MainMsg::Logout => {
                let _ = sender.output(MainOutput::Logout);
            }
        }
    }
}

impl MainPage {
    fn set_vm_operating(&mut self, vmid: u32, operating: bool) {
        // Find the index first
        let idx = {
            let guard = self.vms.guard();
            let result = guard.iter().position(|item| item.vm.vmid == vmid);
            result
        };

        // Then send message if found
        if let Some(idx) = idx {
            self.vms.send(idx, VMItemInput::SetOperating(operating));
        }
    }
}
