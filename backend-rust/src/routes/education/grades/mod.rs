pub mod admin;
pub mod list;
pub mod list_simple;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/list-simple", post(list_simple::handler))
        .nest("/admin", admin::router())
}
