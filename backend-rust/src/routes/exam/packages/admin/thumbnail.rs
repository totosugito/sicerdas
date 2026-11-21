use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_thumbnail::{
    admin_thumbnail, UploadedThumbnail,
};
use crate::modules::exam::types::ThumbnailQuery;
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
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    let is_remove = query.action.as_deref() == Some("remove");
    let mut file: Option<UploadedThumbnail> = None;

    if !is_remove {
        while let Some(field) = multipart
            .next_field()
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?
        {
            if field.file_name().is_some() || field.name() == Some("file") {
                let content_type = field
                    .content_type()
                    .unwrap_or("application/octet-stream")
                    .to_string();
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|e| AppError::BadRequest(e.to_string()))?
                    .to_vec();
                file = Some(UploadedThumbnail { bytes, content_type });
                break;
            }
        }
    }

    let data = admin_thumbnail(&state, locale.0, id, query.action.as_deref(), file).await?;
    let msg_key = if is_remove {
        LocaleKey::ExamPackagesThumbnailRemoveSuccess
    } else {
        LocaleKey::ExamPackagesThumbnailUploadSuccess
    };
    Ok(ApiResponse::ok(locale.t(msg_key), data))
}
