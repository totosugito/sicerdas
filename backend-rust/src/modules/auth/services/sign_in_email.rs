use crate::app::AppState;
use crate::db::entities::{users, users_accounts};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::auth::crypto::verify_password;
use crate::modules::auth::services::session::create_session;
use crate::modules::auth::types::{AuthSessionInfo, AuthUser};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

pub async fn execute(
    state: &AppState,
    lang: Lang,
    email: &str,
    password: &str,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(AuthSessionInfo, AuthUser), AppError> {
    let email = email.trim().to_lowercase();
    if email.is_empty() || password.is_empty() {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthEmailAndPasswordRequired,
        )));
    }

    let Some(user) = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?
    else {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    };

    if user.banned {
        return Err(AppError::Forbidden(translate(
            lang,
            LocaleKey::AuthForbidden,
        )));
    }

    let Some(account) = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(user.id))
        .filter(users_accounts::Column::ProviderId.eq("credential"))
        .one(&state.db)
        .await?
    else {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    };

    let Some(stored_hash) = account.password.as_deref() else {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    };

    let valid = verify_password(stored_hash, password).unwrap_or(false);
    if !valid {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    }

    create_session(state, &user, ip_address, user_agent).await
}
