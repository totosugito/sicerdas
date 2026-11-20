pub mod element;

use crate::app::AppState;
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new().route("/element/{atomicNumber}", get(element::handler))
}
