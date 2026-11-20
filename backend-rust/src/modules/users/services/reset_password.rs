use crate::app::AppState;
use crate::db::entities::{users, users_accounts};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::crypto::hash_password;
use crate::modules::users::types::ResetPasswordBody;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

pub async fn reset_password(
    state: &AppState,
    body: ResetPasswordBody,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if body.new_password.len() < 6 {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserNewPasswordRequired),
        ));
    }

    let _user = users::Entity::find_by_id(body.id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let account = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(body.id))
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserAccountNotFound)))?;

    let hashed = hash_password(&body.new_password).map_err(AppError::Internal)?;
    let mut active: users_accounts::ActiveModel = account.into();
    active.password = Set(Some(hashed));
    active.updated_at = Set(Utc::now().fixed_offset());
    active.update(&state.db).await?;

    Ok(())
}
