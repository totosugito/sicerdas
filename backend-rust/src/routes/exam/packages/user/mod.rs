pub mod bookmark;
pub mod favorites;
pub mod generate_custom;
pub mod list_custom;
pub mod rating;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bookmark", post(bookmark::handler))
        .route("/rating", post(rating::handler))
        .route("/favorites", post(favorites::handler))
        .route("/generate-custom", post(generate_custom::handler))
        .route("/list-custom", post(list_custom::handler))
}
