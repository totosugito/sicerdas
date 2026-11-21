use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::user_progress::complete_lecture::complete_lecture;
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
    Path(lecture_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = complete_lecture(&state, locale.0, lecture_id, auth.user.id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseLecturesDetailSuccess),
        data,
    ))
}
