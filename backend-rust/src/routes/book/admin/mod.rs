pub mod update_all_group_stats;
pub mod update_group_stats;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/update-group-stats/{groupId}", post(update_group_stats::handler))
        .route("/update-all-group-stats", post(update_all_group_stats::handler))
}
