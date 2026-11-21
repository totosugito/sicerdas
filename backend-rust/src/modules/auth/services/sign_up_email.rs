use crate::app::AppState;
use crate::db::entities::users::{users, users_accounts, users_profiles};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::auth::crypto::hash_password;
use crate::modules::auth::services::session::create_session;
use crate::modules::auth::types::{AuthSessionInfo, AuthUser};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use uuid::Uuid;

pub async fn execute(
    state: &AppState,
    lang: Lang,
    email: &str,
    password: &str,
    name: Option<&str>,
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

    let existing = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::Conflict(translate(
            lang,
            LocaleKey::UserCreateEmailExists,
        )));
    }

    let password_hash =
        hash_password(password).map_err(|e| AppError::Internal(format!("Hash error: {e}")))?;

    let display_name = name
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| email.split('@').next().unwrap_or("User"))
        .to_string();

    let now = Utc::now().fixed_offset();
    let user_id = Uuid::new_v4();

    let txn = state.db.begin().await?;

    let user = users::ActiveModel {
        id: Set(user_id),
        email: Set(email.clone()),
        email_verified: Set(false),
        name: Set(display_name),
        role: Set(users::UserRole::User),
        image: Set(None),
        created_at: Set(now),
        updated_at: Set(now),
        banned: Set(false),
        ban_reason: Set(None),
        ban_expires: Set(None),
    }
    .insert(&txn)
    .await?;

    users_accounts::ActiveModel {
        id: Set(Uuid::new_v4()),
        account_id: Set(user_id.to_string()),
        provider_id: Set("credential".to_string()),
        user_id: Set(user_id),
        access_token: Set(None),
        refresh_token: Set(None),
        id_token: Set(None),
        access_token_expires_at: Set(None),
        refresh_token_expires_at: Set(None),
        scope: Set(None),
        password: Set(Some(password_hash)),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&txn)
    .await?;

    users_profiles::ActiveModel {
        id: Set(user_id),
        school: Set(None),
        education_level: Set(None),
        grade: Set(None),
        phone: Set(None),
        address: Set(None),
        bio: Set(None),
        date_of_birth: Set(None),
        tier_id: Set(Some("free".to_string())),
        extra: Set(Some(serde_json::json!({}))),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&txn)
    .await?;

    txn.commit().await?;

    create_session(state, &user, ip_address, user_agent).await
}
