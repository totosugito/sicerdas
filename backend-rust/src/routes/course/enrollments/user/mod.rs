pub mod active;
pub mod completed;
pub mod enroll;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/enroll/{courseId}", post(enroll::handler))
        .route("/active", get(active::handler))
        .route("/completed", get(completed::handler))
}
