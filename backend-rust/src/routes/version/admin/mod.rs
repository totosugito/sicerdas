pub mod create;
pub mod delete;
pub mod detail;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete as axum_delete, get, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/detail/{id}", get(detail::handler))
        .route("/create", post(create::handler))
        .route("/update/{id}", put(update::handler))
        .route("/delete/{id}", axum_delete(delete::handler))
}
