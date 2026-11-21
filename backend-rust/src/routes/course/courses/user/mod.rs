pub mod bookmark;
pub mod favorites;
pub mod like;
pub mod rating;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bookmark/{courseId}", post(bookmark::handler))
        .route("/favorites", get(favorites::handler))
        .route("/like/{courseId}", post(like::handler))
        .route("/rating/{courseId}", post(rating::handler))
}
