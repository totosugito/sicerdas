pub mod create_model;
pub mod details_model;
pub mod models_stats;
pub mod update_model;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/models/stats", get(models_stats::handler))
        .route("/create-model", post(create_model::handler))
        .route(
            "/model/{id}",
            get(details_model::handler).patch(update_model::handler),
        )
}
