use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::courses::detail_course::user_detail_course;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = auth.map(|a| a.user.id);
    let data = user_detail_course(&state, locale.0, id, user_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesDetailSuccess),
        data,
    ))
}
