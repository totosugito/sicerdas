pub mod create_chapter;
pub mod delete_chapter;
pub mod detail_chapter;
pub mod list_chapter;
pub mod reorder_chapter;
pub mod update_chapter;

use crate::app::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list/{courseId}", get(list_chapter::handler))
        .route("/detail/{id}", get(detail_chapter::handler))
        .route("/create", post(create_chapter::handler))
        .route("/update/{id}", put(update_chapter::handler))
        .route("/delete/{id}", delete(delete_chapter::handler))
        .route("/reorder/{courseId}", put(reorder_chapter::handler))
}
