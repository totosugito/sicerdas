pub mod complete;
pub mod syllabus;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/syllabus/{courseId}", get(syllabus::handler))
        .route("/lecture/{lectureId}/complete", post(complete::handler))
}
