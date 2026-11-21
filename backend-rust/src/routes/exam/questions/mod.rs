pub mod admin;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new().nest("/admin", admin::router())
}
