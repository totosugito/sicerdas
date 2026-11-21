use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::user_stats::subject_stats::subject_stats;
use crate::modules::exam::types::SubjectStatsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<SubjectStatsBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = subject_stats(&state, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamUserStatsSubjectsSuccess),
        data,
    ))
}
