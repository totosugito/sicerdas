use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::user_stats::global_stats::global_stats;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
) -> Result<impl IntoResponse, AppError> {
    let data = global_stats(&state, auth.user.id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamUserStatsGlobalSuccess),
        data,
    ))
}
