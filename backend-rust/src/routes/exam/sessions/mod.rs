pub mod abandon;
pub mod all;
pub mod details;
pub mod history;
pub mod question;
pub mod save_answer;
pub mod start;
pub mod submit;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/start", post(start::handler))
        .route("/details/{id}", get(details::handler))
        .route("/{id}/questions/{questionId}", get(question::handler))
        .route("/save-answer", post(save_answer::handler))
        .route("/submit/{id}", post(submit::handler))
        .route("/abandon/{id}", post(abandon::handler))
        .route("/history", post(history::handler))
        .route("/all", post(all::handler))
}
