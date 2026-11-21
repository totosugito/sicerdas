pub mod create;
pub mod delete;
pub mod deletes;
pub mod list;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/create", post(create::handler))
        .route("/update/{id}", put(update::handler))
        .route("/delete/{id}", delete(delete::handler))
        .route("/deletes", post(deletes::handler))
}
