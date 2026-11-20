use crate::app::AppState;
use crate::db::entities::users::UserRole;
use crate::db::entities::{users, users_accounts, users_profiles};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::crypto::hash_password;
use crate::modules::users::types::{CreateUserBody, CreateUserData};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use serde_json::json;
use uuid::Uuid;

pub async fn create_user(
    state: &AppState,
    body: CreateUserBody,
    locale: RequestLocale,
) -> Result<CreateUserData, AppError> {
    let email = body.email.trim().to_lowercase();
    if body.password.len() < 6 {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserNewPasswordRequired),
        ));
    }

    let existing = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserCreateEmailExists),
        ));
    }

    let hashed = hash_password(&body.password).map_err(AppError::Internal)?;
    let now = Utc::now().fixed_offset();
    let user_id = Uuid::new_v4();
    let role = body.role.unwrap_or(UserRole::User);

    let txn = state.db.begin().await?;

    let inserted = users::ActiveModel {
        id: Set(user_id),
        email: Set(email),
        email_verified: Set(true),
        name: Set(body.name.trim().to_string()),
        role: Set(role),
        image: Set(None),
        created_at: Set(now),
        updated_at: Set(now),
        banned: Set(false),
        ban_reason: Set(None),
        ban_expires: Set(None),
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
        extra: Set(Some(json!({}))),
        created_at: Set(now),
        updated_at: Set(now),
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
        password: Set(Some(hashed)),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&txn)
    .await?;

    txn.commit().await?;

    Ok(CreateUserData {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        role: inserted.role.as_str().to_string(),
        created_at: inserted.created_at.to_rfc3339(),
        updated_at: inserted.updated_at.to_rfc3339(),
    })
}
