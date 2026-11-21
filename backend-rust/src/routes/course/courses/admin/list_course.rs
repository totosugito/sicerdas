use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::courses::list_course::list_courses;
use crate::modules::course::types::CourseListQuery;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<CourseListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_courses(&state, body, true, None).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesListSuccess),
        data,
    ))
}
