use crate::app::AppState;
use crate::db::entities::users;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::services::session::resolve_avatar_url;
use crate::modules::users::types::{process_and_save_avatar, AvatarResponseData, UploadedFile};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_avatar(
    state: &AppState,
    user_id: Uuid,
    action: Option<&str>,
    file: Option<UploadedFile>,
    session_token_to_invalidate: Option<&str>,
    locale: RequestLocale,
) -> Result<AvatarResponseData, AppError> {
    let user = users::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let now = Utc::now().fixed_offset();

    if action == Some("remove") {
        if let Some(old_path) = user.image.as_deref() {
            if !old_path.starts_with("http://") && !old_path.starts_with("https://") {
                state.storage.delete_file(old_path).await;
            }
        }
        let mut active: users::ActiveModel = user.into();
        active.image = Set(None);
        active.updated_at = Set(now);
        let updated = active.update(&state.db).await?;

        if let Some(tok) = session_token_to_invalidate {
            state.session_cache.invalidate(tok).await;
        }

        return Ok(AvatarResponseData {
            id: updated.id,
            name: updated.name,
            image: None,
        });
    }

    let file = file.ok_or_else(|| AppError::BadRequest(locale.t(LocaleKey::UserNoFileUploaded)))?;
    let relative_path = process_and_save_avatar(
        state,
        user_id,
        user.created_at.with_timezone(&Utc),
        user.image.as_deref(),
        &file,
        locale,
    )
    .await?;

    let mut active: users::ActiveModel = user.into();
    active.image = Set(Some(relative_path));
    active.updated_at = Set(now);
    let updated = active.update(&state.db).await?;

    if let Some(tok) = session_token_to_invalidate {
        state.session_cache.invalidate(tok).await;
    }

    Ok(AvatarResponseData {
        id: updated.id,
        name: updated.name,
        image: resolve_avatar_url(&state.config, updated.image.as_deref()),
    })
}
