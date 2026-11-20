pub mod live;
pub mod ready;
pub mod status;

use crate::app::AppState;
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(status::handler))
        .route("/live", get(live::handler))
        .route("/ready", get(ready::handler))
}
