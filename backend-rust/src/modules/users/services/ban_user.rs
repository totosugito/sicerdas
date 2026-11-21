use crate::app::AppState;
use crate::db::entities::users::{users, users_sessions};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::users::types::BanUserBody;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn ban_user(
    state: &AppState,
    admin_id: Uuid,
    body: BanUserBody,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if admin_id == body.id {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserUpdateCannotBanSelf),
        ));
    }

    let user = users::Entity::find_by_id(body.id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let mut active: users::ActiveModel = user.into();
    active.banned = Set(body.banned);
    active.ban_reason = Set(if body.banned { body.ban_reason } else { None });
    active.updated_at = Set(Utc::now().fixed_offset());
    active.update(&state.db).await?;

    let sessions = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(body.id))
        .all(&state.db)
        .await?;
    for s in sessions {
        state.session_cache.invalidate(&s.token).await;
    }

    Ok(())
}
