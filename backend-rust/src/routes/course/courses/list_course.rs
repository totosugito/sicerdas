use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::courses::list_course::list_courses;
use crate::modules::course::types::CourseListQuery;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    Json(body): Json<CourseListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = auth.map(|a| a.user.id);
    let data = list_courses(&state, body, false, user_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesListSuccess),
        data,
    ))
}
