use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::course::services::courses::structure_course::public_structure_course;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = public_structure_course(&state, id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesDetailSuccess),
        data,
    ))
}
