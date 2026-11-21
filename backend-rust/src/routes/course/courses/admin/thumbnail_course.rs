use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::courses::thumbnail_course::update_course_thumbnail;
use crate::modules::course::types::ThumbnailQuery;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Multipart, Path, Query, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
    Query(query): Query<ThumbnailQuery>,
    multipart: Option<Multipart>,
) -> Result<impl IntoResponse, AppError> {
    let mut uploaded: Option<(Vec<u8>, String)> = None;

    if query.action.as_deref() != Some("remove") {
        if let Some(mut mp) = multipart {
            while let Some(field) = mp
                .next_field()
                .await
                .map_err(|e| AppError::BadRequest(format!("Invalid multipart: {e}")))?
            {
                let content_type = field
                    .content_type()
                    .unwrap_or("application/octet-stream")
                    .to_string();
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|e| AppError::BadRequest(format!("Failed to read file: {e}")))?
                    .to_vec();
                uploaded = Some((bytes, content_type));
                break;
            }
        }
    }

    let data = update_course_thumbnail(
        &state,
        locale.0,
        id,
        query.action.as_deref(),
        uploaded,
    )
    .await?;

    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesUpdateSuccess),
        data,
    ))
}
