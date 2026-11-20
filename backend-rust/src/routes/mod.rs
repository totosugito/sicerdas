pub mod auth;
pub mod health;

use crate::app::AppState;
use axum::Router;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .nest("/auth", auth::router())
        .nest("/health", health::router())
}
