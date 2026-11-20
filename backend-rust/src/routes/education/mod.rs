pub mod categories;
pub mod grades;
pub mod tags;

use crate::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new()
        .nest("/categories", categories::router())
        .nest("/grades", grades::router())
        .nest("/tags", tags::router())
}
