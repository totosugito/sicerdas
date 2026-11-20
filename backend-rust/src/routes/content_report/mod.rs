pub mod create;

use crate::app::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new().route("/create", post(create::handler))
}
