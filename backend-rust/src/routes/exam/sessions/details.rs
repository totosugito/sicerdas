use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::sessions::details_session::details_session;
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
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = details_session(&state, locale.0, auth.user.id, id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSessionsDetailsSuccess),
        data,
    ))
}
