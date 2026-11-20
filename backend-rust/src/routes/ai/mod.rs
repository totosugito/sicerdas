pub mod model;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new().nest("/model", model::router())
}
