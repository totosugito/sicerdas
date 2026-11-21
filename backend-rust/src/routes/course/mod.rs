pub mod chapters;
pub mod courses;
pub mod enrollments;
pub mod lecture_texts;
pub mod lectures;
pub mod user_progress;
pub mod user_stats;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new()
        .nest("/courses", courses::router())
        .nest("/chapters", chapters::router())
        .nest("/lectures", lectures::router())
        .nest("/lecture-texts", lecture_texts::router())
        .nest("/enrollments", enrollments::router())
        .nest("/user-progress", user_progress::router())
        .nest("/user-stats", user_stats::router())
}
