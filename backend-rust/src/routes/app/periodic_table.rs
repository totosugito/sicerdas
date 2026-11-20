use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::app::services::periodic_table::get_periodic_sync_data;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
) -> Result<impl IntoResponse, AppError> {
    let data = get_periodic_sync_data(&state).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::PeriodicSuccess),
        data,
    ))
}
