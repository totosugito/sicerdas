pub mod app_latest;
pub mod book_info;
pub mod dictionary_data;
pub mod periodic_data;
pub mod periodic_table;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/app-latest", post(app_latest::handler))
        .route("/book-info", get(book_info::handler))
        .route("/dictionary-data", get(dictionary_data::handler))
        .route("/periodic-data", get(periodic_data::handler))
        .route("/periodic-table", get(periodic_table::handler))
}
