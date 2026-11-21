pub mod create;
pub mod delete;
pub mod detail;
pub mod list;
pub mod list_simple;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/list-simple", post(list_simple::handler))
        .route("/detail/{id}", get(detail::handler))
        .route("/create", post(create::handler))
        .route("/update/{id}", put(update::handler))
        .route("/delete/{id}", delete(delete::handler))
}
