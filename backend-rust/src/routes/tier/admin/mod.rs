pub mod create_tier;
pub mod delete_tier;
pub mod details_tier;
pub mod list_tier;
pub mod update_tier;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list-tier", get(list_tier::handler))
        .route("/create-tier", post(create_tier::handler))
        .route(
            "/{slug}",
            get(details_tier::handler)
                .patch(update_tier::handler)
                .delete(delete_tier::handler),
        )
}
