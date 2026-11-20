use crate::app::AppState;
use crate::db::entities::users_accounts;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::crypto::{hash_password, verify_password};
use crate::modules::users::types::ChangePasswordBody;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn change_password(
    state: &AppState,
    user_id: Uuid,
    body: ChangePasswordBody,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if body.current_password.trim().is_empty() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserCurrentPasswordRequired),
        ));
    }
    if body.new_password.trim().len() < 6 {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserNewPasswordRequired),
        ));
    }
    if body.current_password == body.new_password {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserPasswordsMustBeDifferent),
        ));
    }

    let account = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserAccountNotFound)))?;

    let stored_hash = account
        .password
        .as_deref()
        .ok_or_else(|| AppError::BadRequest(locale.t(LocaleKey::UserAccountHasNoPassword)))?;

    let valid = verify_password(stored_hash, &body.current_password).map_err(AppError::Internal)?;
    if !valid {
        return Err(AppError::Forbidden(
            locale.t(LocaleKey::UserCurrentPasswordIncorrect),
        ));
    }

    let hashed = hash_password(&body.new_password).map_err(AppError::Internal)?;
    let mut active: users_accounts::ActiveModel = account.into();
    active.password = Set(Some(hashed));
    active.updated_at = Set(Utc::now().fixed_offset());
    active.update(&state.db).await?;

    Ok(())
}
