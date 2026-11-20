pub mod create;
pub mod delete;
pub mod update;

use crate::app::AppState;
use axum::{
    routing::{delete as axum_delete, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/create", post(create::handler))
        .route("/update/{id}", put(update::handler))
        .route("/delete/{id}", axum_delete(delete::handler))
}
