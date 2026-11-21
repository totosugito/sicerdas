pub mod clone;
pub mod create;
pub mod delete;
pub mod detail;
pub mod list;
pub mod list_simple;
pub mod thumbnail;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete as axum_delete, get, patch, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/list-simple", post(list_simple::handler))
        .route("/detail/{id}", get(detail::handler))
        .route("/create", post(create::handler))
        .route("/update/{id}", put(update::handler))
        .route("/delete/{id}", axum_delete(delete::handler))
        .route("/clone", post(clone::handler))
        .route("/thumbnail/{id}", patch(thumbnail::handler))
}
