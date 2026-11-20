use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::avatar_update::update_avatar;
use crate::modules::users::types::UploadedFile;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Multipart, Query, State},
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct AvatarQuery {
    pub action: Option<String>,
}

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<AvatarQuery>,
    multipart: Option<Multipart>,
) -> Result<impl IntoResponse, AppError> {
    let action = query.action.as_deref();
    let mut file = None;

    if action != Some("remove") {
        let mut mp = multipart
            .ok_or_else(|| AppError::BadRequest(locale.t(LocaleKey::UserNoFileUploaded)))?;
        while let Some(field) = mp
            .next_field()
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?
        {
            if field.file_name().is_some() || field.name() == Some("file") || field.name() == Some("image") {
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
            }
        }
    }

    let data = update_avatar(
        &state,
        auth.user.id,
        action,
        file,
        Some(&auth.session.token),
        locale,
    )
    .await?;

    let msg_key = if action == Some("remove") {
        LocaleKey::UserAvatarRemovedSuccessfully
    } else {
        LocaleKey::UserAvatarUpdatedSuccessfully
    };

    Ok(ApiResponse::ok(locale.t(msg_key), data))
}
