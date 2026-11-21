use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::lecture_texts::delete_lecture_text::delete_lecture_text;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    delete_lecture_text(&state, locale.0, id).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::CourseLectureTextsDeleteSuccess),
    ))
}
