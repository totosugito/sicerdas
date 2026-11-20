pub mod admin;
pub mod user;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new()
        .nest("/user", user::router())
        .nest("/admin", admin::router())
}
