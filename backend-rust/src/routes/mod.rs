pub mod ai;
pub mod app;
pub mod auth;
pub mod book;
pub mod content_report;
pub mod course;
pub mod education;
pub mod health;
pub mod periodic_table;
pub mod tier;
pub mod users;
pub mod version;

use crate::app::AppState;
use axum::Router;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .nest("/ai", ai::router())
        .nest("/app", app::router())
        .nest("/auth", auth::router())
        .nest("/book", book::router())
        .nest("/content-report", content_report::router())
        .nest("/course", course::router())
        .nest("/education", education::router())
        .nest("/health", health::router())
        .nest("/periodic-table", periodic_table::router())
        .nest("/tier", tier::router())
        .nest("/users", users::router())
        .nest("/version", version::router())
}
