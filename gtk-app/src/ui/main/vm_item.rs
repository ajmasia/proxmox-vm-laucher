use libadwaita as adw;
use libadwaita::prelude::*;
use relm4::prelude::*;
use relm4::factory::{DynamicIndex, FactoryComponent, FactorySender};

use crate::models::VMInfo;

/// Input messages for VMItem
#[derive(Debug)]
pub enum VMItemInput {
    SetOperating(bool),
    UpdateStatus(String),
}

/// Output messages sent to parent
#[derive(Debug)]
pub enum VMItemOutput {
    Start(u32, String),      // vmid, node
    Stop(u32, String),       // vmid, node
    Connect(u32, String),    // vmid, node
}

/// VM item for the factory list
pub struct VMItem {
    pub vm: VMInfo,
    is_operating: bool,
}

#[relm4::factory(pub)]
impl FactoryComponent for VMItem {
    type Init = VMInfo;
    type Input = VMItemInput;
    type Output = VMItemOutput;
    type CommandOutput = ();
    type ParentWidget = gtk::ListBox;

    view! {
        #[root]
        adw::ActionRow {
            set_title: &self.vm.name,
            #[watch]
            set_subtitle: &format!("VM {} · {} · {}", self.vm.vmid, self.vm.node, self.vm.status),

            // Status icon prefix
            add_prefix = &gtk::Image {
                #[watch]
                set_icon_name: Some(get_status_icon(&self.vm.status)),
                #[watch]
                set_css_classes: &[get_status_class(&self.vm.status)],
            },

            // Spinner when operating
            add_suffix = &gtk::Spinner {
                #[watch]
                set_spinning: self.is_operating,
                #[watch]
                set_visible: self.is_operating,
            },

            // IP address if available
            add_suffix = &gtk::Label {
                #[watch]
                set_label: self.vm.ip_address.as_deref().unwrap_or(""),
                add_css_class: "dim-label",
                #[watch]
                set_visible: self.vm.ip_address.is_some() && !self.is_operating,
            },

            // Action buttons suffix
            add_suffix = &gtk::Box {
                set_spacing: 4,
                set_valign: gtk::Align::Center,
                #[watch]
                set_visible: !self.is_operating,

                // Start/Stop button
                gtk::Button {
                    #[watch]
                    set_icon_name: if self.vm.is_running() || self.vm.is_paused() {
                        "media-playback-stop-symbolic"
                    } else {
                        "media-playback-start-symbolic"
                    },
                    set_valign: gtk::Align::Center,
                    add_css_class: "flat",
                    #[watch]
                    set_tooltip_text: Some(if self.vm.is_running() || self.vm.is_paused() {
                        "Stop VM"
                    } else {
                        "Start VM"
                    }),
                    connect_clicked[sender, vmid = self.vm.vmid, node = self.vm.node.clone(), is_running = self.vm.is_running(), is_paused = self.vm.is_paused()] => move |_| {
                        if is_running || is_paused {
                            let _ = sender.output(VMItemOutput::Stop(vmid, node.clone()));
                        } else {
                            let _ = sender.output(VMItemOutput::Start(vmid, node.clone()));
                        }
                    },
                },

                // Connect button (only for running VMs with SPICE)
                gtk::Button {
                    set_icon_name: "utilities-terminal-symbolic",
                    set_valign: gtk::Align::Center,
                    add_css_class: "flat",
                    set_tooltip_text: Some("Connect"),
                    #[watch]
                    set_visible: self.vm.is_running() && self.vm.spice,
                    connect_clicked[sender, vmid = self.vm.vmid, node = self.vm.node.clone()] => move |_| {
                        let _ = sender.output(VMItemOutput::Connect(vmid, node.clone()));
                    },
                },
            },
        }
    }

    fn init_model(vm: Self::Init, _index: &DynamicIndex, _sender: FactorySender<Self>) -> Self {
        Self {
            vm,
            is_operating: false,
        }
    }

    fn update(&mut self, msg: Self::Input, _sender: FactorySender<Self>) {
        match msg {
            VMItemInput::SetOperating(operating) => {
                self.is_operating = operating;
            }
            VMItemInput::UpdateStatus(status) => {
                self.vm.status = status;
            }
        }
    }
}

fn get_status_icon(status: &str) -> &'static str {
    match status {
        "running" => "media-playback-start-symbolic",
        "paused" => "media-playback-pause-symbolic",
        _ => "media-playback-stop-symbolic",
    }
}

fn get_status_class(status: &str) -> &'static str {
    match status {
        "running" => "success",
        "paused" => "warning",
        _ => "dim-label",
    }
}
