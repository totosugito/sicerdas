use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::user_stats::activity_stats::activity_stats;
use crate::modules::exam::types::ActivityQuery;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<ActivityQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = activity_stats(&state, auth.user.id, query.days.unwrap_or(7)).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamUserStatsActivitySuccess),
        data,
    ))
}
