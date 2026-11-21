pub mod admin;
pub mod detail_book;
pub mod filter_params;
pub mod list_book;
pub mod proxy_pdf;
pub mod update_download;
pub mod user;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/list", post(list_book::handler))
        .route("/detail/{bookId}", get(detail_book::handler))
        .route("/filter-params", get(filter_params::handler))
        .route("/update-download", post(update_download::handler))
        .route("/proxy-pdf", get(proxy_pdf::handler))
        .route("/proxy-pdf/{filename}", get(proxy_pdf::handler_with_filename))
        .nest("/user", user::router())
        .nest("/admin", admin::router())
}
