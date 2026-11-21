pub mod list;

use crate::app::AppState;
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new().route("/list", get(list::handler))
}
