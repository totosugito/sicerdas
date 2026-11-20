pub mod admin;
pub mod app_tier;

use crate::app::AppState;
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/app-tier", get(app_tier::handler))
        .nest("/admin", admin::router())
}
