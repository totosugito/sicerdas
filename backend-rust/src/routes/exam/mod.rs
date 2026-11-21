pub mod leaderboard;
pub mod package_questions;
pub mod package_sections;
pub mod packages;
pub mod passages;
pub mod question_options;
pub mod question_solutions;
pub mod question_tags;
pub mod questions;
pub mod sessions;
pub mod subjects;
pub mod user_stats;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new()
        .nest("/subjects", subjects::router())
        .nest("/passages", passages::router())
        .nest("/questions", questions::router())
        .nest("/question-options", question_options::router())
        .nest("/question-solutions", question_solutions::router())
        .nest("/question-tags", question_tags::router())
        .nest("/packages", packages::router())
        .nest("/package-sections", package_sections::router())
        .nest("/package-questions", package_questions::router())
        .nest("/sessions", sessions::router())
        .nest("/leaderboard", leaderboard::router())
        .nest("/user-stats", user_stats::router())
}
