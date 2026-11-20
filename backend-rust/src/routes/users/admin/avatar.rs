use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::avatar_update::update_avatar;
use crate::modules::users::types::UploadedFile;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Multipart, Query, State},
};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct AdminAvatarQuery {
    pub id: Option<Uuid>,
    pub action: Option<String>,
}

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Query(query): Query<AdminAvatarQuery>,
    multipart: Option<Multipart>,
) -> Result<impl IntoResponse, AppError> {
    let mut target_id = query.id;
    let mut action = query.action;
    let mut file = None;

    if let Some(mut mp) = multipart {
        while let Some(field) = mp
            .next_field()
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?
        {
            if field.file_name().is_some() {
                let content_type = field
                    .content_type()
                    .unwrap_or("application/octet-stream")
                    .to_string();
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|e| AppError::BadRequest(e.to_string()))?
                    .to_vec();
                file = Some(UploadedFile {
                    bytes,
                    content_type,
                });
                break;
            } else {
                let name = field.name().unwrap_or_default().to_string();
                let val = field
                    .text()
                    .await
                    .map_err(|e| AppError::BadRequest(e.to_string()))?;
                if name == "id" {
                    target_id = Uuid::parse_str(val.trim()).ok();
                } else if name == "action" {
                    action = Some(val);
                }
            }
        }
    }

    let user_id = target_id.ok_or_else(|| AppError::BadRequest(locale.t(LocaleKey::UserMissingUserId)))?;
    let data = update_avatar(&state, user_id, action.as_deref(), file, None, locale).await?;

    let msg_key = if action.as_deref() == Some("remove") {
        LocaleKey::UserAvatarRemovedSuccessfully
    } else {
        LocaleKey::UserAvatarUpdatedSuccessfully
    };
    Ok(ApiResponse::ok(locale.t(msg_key), data))
}
