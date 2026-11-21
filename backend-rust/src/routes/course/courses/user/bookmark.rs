use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::courses::interactions::toggle_bookmark;
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
    Path(course_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = toggle_bookmark(&state, locale.0, course_id, auth.user.id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseBookmarkUpdated),
        data,
    ))
}
