use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::chapters::reorder_chapter::reorder_chapters;
use crate::modules::course::types::AdminReorderBody;
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
    RequireAdmin(_admin): RequireAdmin,
    Path(course_id): Path<Uuid>,
    Json(body): Json<AdminReorderBody>,
) -> Result<impl IntoResponse, AppError> {
    reorder_chapters(&state, course_id, body).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::CourseChaptersReorderSuccess),
    ))
}
