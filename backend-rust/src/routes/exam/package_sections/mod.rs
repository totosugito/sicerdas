pub mod admin;
pub mod list;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .nest("/admin", admin::router())
}
