use crate::app::AppState;
use crate::db::entities::course_enrollments::EnrollmentStatus;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::enrollments::list_user_courses::list_user_courses;
use crate::modules::course::types::{UserCourseListQuery, UserCoursePaginatedResponse};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<UserCourseListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10);
    let (data, pagination) = list_user_courses(
        &state,
        auth.user.id,
        EnrollmentStatus::Active,
        page,
        limit,
    )
    .await?;
    Ok((
        StatusCode::OK,
        Json(UserCoursePaginatedResponse {
            success: true,
            message: locale.t(LocaleKey::CourseCoursesListSuccess),
            data,
            pagination,
        }),
    ))
}
