use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::courses::interactions::rate_course;
use crate::modules::course::types::CourseRatingBody;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Path(course_id): Path<Uuid>,
    Json(body): Json<CourseRatingBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = rate_course(&state, locale.0, course_id, auth.user.id, body.rating).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseRatingUpdated),
        data,
    ))
}
