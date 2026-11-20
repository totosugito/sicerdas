use crate::app::AppState;
use crate::error::AppError;
use crate::locales::RequestLocale;
use crate::modules::app::services::periodic_data::proxy_periodic_zip;
use axum::{extract::State, response::Response};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
) -> Result<Response, AppError> {
    proxy_periodic_zip(&state, locale).await
}
