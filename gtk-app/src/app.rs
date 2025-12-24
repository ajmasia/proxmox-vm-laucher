use libadwaita as adw;
use libadwaita::prelude::*;
use relm4::prelude::*;
use relm4::gtk;

pub struct App {
    counter: u32,
}

#[derive(Debug)]
pub enum AppMsg {
    Increment,
}

#[relm4::component(pub)]
impl SimpleComponent for App {
    type Init = ();
    type Input = AppMsg;
    type Output = ();

    view! {
        adw::ApplicationWindow {
            set_title: Some("PVE Launcher"),
            set_default_size: (800, 600),

            #[wrap(Some)]
            set_content = &gtk::Box {
                set_orientation: gtk::Orientation::Vertical,

                // HeaderBar
                adw::HeaderBar {
                    #[wrap(Some)]
                    set_title_widget = &gtk::Label {
                        set_label: "PVE Launcher",
                        add_css_class: "title",
                    },
                },

                // Content
                gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,
                    set_spacing: 12,
                    set_margin_all: 24,
                    set_valign: gtk::Align::Center,
                    set_halign: gtk::Align::Center,
                    set_vexpand: true,

                    gtk::Label {
                        set_label: "GTK4 + Relm4 + Libadwaita",
                        add_css_class: "title-1",
                    },

                    gtk::Label {
                        #[watch]
                        set_label: &format!("Counter: {}", model.counter),
                        add_css_class: "title-2",
                    },

                    gtk::Button {
                        set_label: "Click me!",
                        add_css_class: "suggested-action",
                        add_css_class: "pill",
                        connect_clicked => AppMsg::Increment,
                    },
                },
            },
        }
    }

    fn init(
        _init: Self::Init,
        root: Self::Root,
        _sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        let model = App { counter: 0 };
        let widgets = view_output!();
        ComponentParts { model, widgets }
    }

    fn update(&mut self, msg: Self::Input, _sender: ComponentSender<Self>) {
        match msg {
            AppMsg::Increment => {
                self.counter += 1;
            }
        }
    }
}
