pub mod bookmark;
pub mod favorites;
pub mod history;
pub mod rating;
pub mod stats;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bookmark", post(bookmark::handler))
        .route("/favorites", get(favorites::handler))
        .route("/history", get(history::handler))
        .route("/rating", post(rating::handler))
        .route("/stats", get(stats::handler))
}
