pub mod admin;
pub mod detail;
pub mod filter_params;
pub mod list;
pub mod user;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/detail/{id}", get(detail::handler))
        .route("/filter-params", get(filter_params::handler))
        .nest("/admin", admin::router())
        .nest("/user", user::router())
}
