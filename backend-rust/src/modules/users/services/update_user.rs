use crate::app::AppState;
use crate::db::entities::users::{users, users_sessions};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::services::session::resolve_avatar_url;
use crate::modules::users::types::{UpdateUserBody, UserResponseItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

pub async fn update_user(
    state: &AppState,
    body: UpdateUserBody,
    locale: RequestLocale,
) -> Result<UserResponseItem, AppError> {
    let user = users::Entity::find_by_id(body.id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    if let Some(new_email) = body.email.as_deref().map(str::trim) {
        if new_email != user.email {
            let exists = users::Entity::find()
                .filter(users::Column::Email.eq(new_email))
                .one(&state.db)
                .await?;
            if exists.is_some() {
                return Err(AppError::Conflict(
                    locale.t(LocaleKey::UserUpdateEmailExists),
                ));
            }
        }
    }

    let mut active: users::ActiveModel = user.into();
    if let Some(name) = body.name {
        active.name = Set(name);
    }
    if let Some(email) = body.email {
        active.email = Set(email.trim().to_string());
    }
    if let Some(role) = body.role {
        active.role = Set(role);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active.update(&state.db).await?;

    let sessions = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(updated.id))
        .all(&state.db)
        .await?;
    for s in sessions {
        state.session_cache.invalidate(&s.token).await;
    }

    let image = resolve_avatar_url(&state.config, updated.image.as_deref());

    Ok(UserResponseItem {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        image,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
        role: updated.role,
        banned: updated.banned,
        ban_reason: updated.ban_reason,
    })
}
