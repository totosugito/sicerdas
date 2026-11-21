use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::book::services::update_all_group_stats::update_all_group_stats;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
) -> Result<impl IntoResponse, AppError> {
    let data = update_all_group_stats(&state).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::BookGroupStatsUpdateAllSuccess),
        data,
    ))
}
