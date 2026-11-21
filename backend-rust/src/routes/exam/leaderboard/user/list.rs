use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::leaderboard::list_leaderboard::list_leaderboard;
use crate::modules::exam::types::LeaderboardBody;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _auth: AuthSession,
    Query(query): Query<LeaderboardBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_leaderboard(&state, query.limit.unwrap_or(50)).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamLeaderboardListSuccess),
        data,
    ))
}
