use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::sessions::question_session::question_session;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Path((id, question_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    let data = question_session(&state, locale.0, auth.user.id, id, question_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSessionsQuestionSuccess),
        data,
    ))
}
