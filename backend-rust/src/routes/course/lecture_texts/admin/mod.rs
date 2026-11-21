pub mod create_lecture_text;
pub mod delete_lecture_text;
pub mod detail_lecture_text;
pub mod list_lecture_text;
pub mod list_simple_lecture_text;
pub mod update_lecture_text;

use crate::app::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", get(list_lecture_text::handler))
        .route("/list-simple", get(list_simple_lecture_text::handler))
        .route("/detail/{id}", get(detail_lecture_text::handler))
        .route("/create", post(create_lecture_text::handler))
        .route("/update/{id}", put(update_lecture_text::handler))
        .route("/delete/{id}", delete(delete_lecture_text::handler))
}
