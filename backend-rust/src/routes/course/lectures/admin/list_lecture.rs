use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::lectures::list_lecture::list_lectures;
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
    Path(chapter_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_lectures(&state, chapter_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseLecturesListSuccess),
        data,
    ))
}
