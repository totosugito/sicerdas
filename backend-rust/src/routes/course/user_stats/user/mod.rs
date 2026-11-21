pub mod categories;
pub mod global;

use crate::app::AppState;
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/global", get(global::handler))
        .route("/categories", get(categories::handler))
}
