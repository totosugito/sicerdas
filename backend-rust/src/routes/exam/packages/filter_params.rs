use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::exam::services::packages::filter_params::filter_params;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
) -> Result<impl IntoResponse, AppError> {
    let data = filter_params(&state).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesFilterParamsSuccess),
        data,
    ))
}
