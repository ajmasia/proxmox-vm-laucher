use libadwaita as adw;
use libadwaita::prelude::*;
use relm4::prelude::*;
use relm4::gtk;

use crate::models::Session;
use crate::ui::login::{LoginPage, LoginOutput};
use crate::ui::main::{MainPage, MainOutput};

/// Application view state
#[derive(Debug, Clone, PartialEq)]
enum AppView {
    Login,
    Main,
}

/// Root application component that manages navigation
pub struct App {
    view: AppView,
    login: Controller<LoginPage>,
    main: Option<Controller<MainPage>>,
}

#[derive(Debug)]
pub enum AppMsg {
    LoggedIn(Session),
    Logout,
}

#[relm4::component(pub)]
impl SimpleComponent for App {
    type Init = ();
    type Input = AppMsg;
    type Output = ();

    view! {
        // Invisible root window - each page has its own window
        adw::ApplicationWindow {
            set_visible: false,
        }
    }

    fn init(
        _init: Self::Init,
        _root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        // Create login page
        let login = LoginPage::builder()
            .launch(())
            .forward(sender.input_sender(), |output| match output {
                LoginOutput::LoggedIn(session) => AppMsg::LoggedIn(session),
            });

        let model = App {
            view: AppView::Login,
            login,
            main: None,
        };

        let widgets = view_output!();

        ComponentParts { model, widgets }
    }

    fn update(&mut self, msg: Self::Input, sender: ComponentSender<Self>) {
        match msg {
            AppMsg::LoggedIn(session) => {
                println!("Logged in to: {}", session.server.name);
                self.view = AppView::Main;

                // Hide login window
                self.login.widget().set_visible(false);

                // Create main page with session
                let main = MainPage::builder()
                    .launch(session)
                    .forward(sender.input_sender(), |output| match output {
                        MainOutput::Logout => AppMsg::Logout,
                    });

                self.main = Some(main);
            }
            AppMsg::Logout => {
                println!("Logged out");
                self.view = AppView::Login;

                // Destroy main page
                self.main = None;

                // Show login window again
                self.login.widget().set_visible(true);
            }
        }
    }
}
