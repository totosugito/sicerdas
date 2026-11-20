pub mod avatar;
pub mod ban;
pub mod create;
pub mod delete;
pub mod deletes;
pub mod details;
pub mod list;
pub mod reset_password;
pub mod stats;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete as axum_delete, get, patch, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/stats", get(stats::handler))
        .route("/{id}", get(details::handler))
        .route("/create", post(create::handler))
        .route("/update", patch(update::handler))
        .route("/ban", post(ban::handler))
        .route("/avatar", post(avatar::handler))
        .route("/reset-password", post(reset_password::handler))
        .route("/delete/{id}", axum_delete(delete::handler))
        .route("/deletes", post(deletes::handler))
}
