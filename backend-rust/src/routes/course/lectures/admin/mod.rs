pub mod create_lecture;
pub mod delete_lecture;
pub mod detail_lecture;
pub mod list_lecture;
pub mod reorder_lecture;
pub mod update_lecture;

use crate::app::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list/{chapterId}", get(list_lecture::handler))
        .route("/detail/{id}", get(detail_lecture::handler))
        .route("/create", post(create_lecture::handler))
        .route("/update/{id}", put(update_lecture::handler))
        .route("/delete/{id}", delete(delete_lecture::handler))
        .route("/reorder/{chapterId}", put(reorder_lecture::handler))
}
