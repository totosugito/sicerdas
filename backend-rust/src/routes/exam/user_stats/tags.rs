use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::user_stats::tag_stats::tag_stats;
use crate::modules::exam::types::TagStatsQuery;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<TagStatsQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = tag_stats(&state, auth.user.id, query).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamUserStatsTagsSuccess),
        data,
    ))
}
