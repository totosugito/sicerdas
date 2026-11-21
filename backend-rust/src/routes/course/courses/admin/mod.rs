pub mod create_course;
pub mod delete_course;
pub mod detail_course;
pub mod list_course;
pub mod structure_course;
pub mod thumbnail_course;
pub mod update_course;

use crate::app::AppState;
use axum::{
    routing::{delete, get, patch, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list_course::handler))
        .route("/detail/{id}", get(detail_course::handler))
        .route("/structure/{id}", get(structure_course::handler))
        .route("/create", post(create_course::handler))
        .route("/update/{id}", put(update_course::handler))
        .route("/delete/{id}", delete(delete_course::handler))
        .route("/thumbnail/{id}", patch(thumbnail_course::handler))
}
