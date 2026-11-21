pub mod admin;
pub mod detail_course;
pub mod filter_params;
pub mod list_course;
pub mod structure_course;
pub mod user;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list_course::handler))
        .route("/detail/{id}", get(detail_course::handler))
        .route("/filter-params", get(filter_params::handler))
        .route("/structure/{id}", get(structure_course::handler))
        .nest("/user", user::router())
        .nest("/admin", admin::router())
}
