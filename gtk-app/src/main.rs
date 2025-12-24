mod app;
mod api;
mod ui;
mod models;
mod utils;

use relm4::RelmApp;
use app::App;

fn main() {
    // Initialize libadwaita
    let app = RelmApp::new("com.ajmasia.pvel");
    app.run::<App>(());
}
