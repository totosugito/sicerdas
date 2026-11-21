use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::book::services::update_group_stats::update_group_stats;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(group_id): Path<i32>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_group_stats(&state, locale.0, group_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::BookGroupStatsUpdateSuccess),
        data,
    ))
}
