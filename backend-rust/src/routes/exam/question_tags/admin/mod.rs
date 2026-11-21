pub mod assign;
pub mod assign_by_names;
pub mod list;
pub mod unassign;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/assign", post(assign::handler))
        .route("/assign-by-names", post(assign_by_names::handler))
        .route("/unassign", post(unassign::handler))
}
