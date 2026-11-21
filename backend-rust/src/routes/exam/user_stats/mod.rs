pub mod activity;
pub mod global;
pub mod subjects;
pub mod tags;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/global", get(global::handler))
        .route("/subjects", post(subjects::handler))
        .route("/tags", get(tags::handler))
        .route("/activity", get(activity::handler))
}
