pub mod assign;
pub mod list;
pub mod sync_order;
pub mod unassign;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list::handler))
        .route("/assign", post(assign::handler))
        .route("/unassign", post(unassign::handler))
        .route("/sync-order", post(sync_order::handler))
}
