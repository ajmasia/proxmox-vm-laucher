mod api;
mod models;
mod ui;
mod utils;

use relm4::RelmApp;
use ui::LoginPage;

fn main() {
    let app = RelmApp::new("com.ajmasia.pvel");
    app.run::<LoginPage>(());
}
