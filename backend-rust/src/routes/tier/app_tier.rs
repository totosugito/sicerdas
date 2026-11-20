use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::tier::services::list_app_tier::list_app_tiers;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
) -> Result<impl IntoResponse, AppError> {
    let data = list_app_tiers(&state).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::AppTierListSuccess),
        data,
    ))
}
