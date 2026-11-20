use crate::app::AppState;
use crate::db::entities::{users, users_sessions};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use chrono::Utc;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use uuid::Uuid;

fn is_fk_violation(err: &sea_orm::DbErr) -> bool {
    err.to_string().contains("23503")
        || err.to_string().to_lowercase().contains("foreign key constraint")
}

pub async fn delete_single_user(
    state: &AppState,
    admin_id: Uuid,
    target_id: Uuid,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if target_id == admin_id {
        return Err(AppError::BadRequest(locale.t(LocaleKey::AuthForbidden)));
    }

    let user = users::Entity::find_by_id(target_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let sessions = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(target_id))
        .all(&state.db)
        .await?;

    users::Entity::delete_by_id(target_id)
        .exec(&state.db)
        .await
        .map_err(|e| {
            if is_fk_violation(&e) {
                AppError::BadRequest(locale.t(LocaleKey::UserDeleteInUse))
            } else {
                AppError::from(e)
            }
        })?;

    for s in sessions {
        state.session_cache.invalidate(&s.token).await;
    }

    state
        .storage
        .delete_storage_directory("users", &target_id.to_string(), user.created_at.with_timezone(&Utc))
        .await;

    Ok(())
}

pub async fn bulk_delete_users(
    state: &AppState,
    ids: Vec<Uuid>,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if ids.is_empty() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserMissingUserId),
        ));
    }

    let targets = users::Entity::find()
        .filter(users::Column::Id.is_in(ids.clone()))
        .all(&state.db)
        .await?;

    let sessions = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.is_in(ids.clone()))
        .all(&state.db)
        .await?;

    users::Entity::delete_many()
        .filter(users::Column::Id.is_in(ids))
        .exec(&state.db)
        .await
        .map_err(|e| {
            if is_fk_violation(&e) {
                AppError::BadRequest(locale.t(LocaleKey::UserDeleteInUse))
            } else {
                AppError::from(e)
            }
        })?;

    for s in sessions {
        state.session_cache.invalidate(&s.token).await;
    }

    for user in targets {
        state
            .storage
            .delete_storage_directory(
                "users",
                &user.id.to_string(),
                user.created_at.with_timezone(&Utc),
            )
            .await;
    }

    Ok(())
}
