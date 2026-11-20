use crate::app::AppState;
use crate::db::entities::{users, users_accounts, users_profiles};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::services::session::resolve_avatar_url;
use crate::modules::users::types::UserDetailsData;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde_json::json;
use uuid::Uuid;

pub async fn get_user_details(
    state: &AppState,
    user_id: Uuid,
    locale: RequestLocale,
) -> Result<UserDetailsData, AppError> {
    let user = users::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let profile = users_profiles::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?;

    let account = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?;

    let image = resolve_avatar_url(&state.config, user.image.as_deref());

    Ok(UserDetailsData {
        id: user.id,
        email: user.email,
        name: user.name,
        image,
        created_at: user.created_at.to_rfc3339(),
        updated_at: user.updated_at.to_rfc3339(),
        email_verified: user.email_verified,
        school: profile.as_ref().and_then(|p| p.school.clone()),
        education_level: profile
            .as_ref()
            .and_then(|p| p.education_level.as_ref().map(|e| e.as_str().to_string())),
        grade: profile.as_ref().and_then(|p| p.grade.clone()),
        phone: profile.as_ref().and_then(|p| p.phone.clone()),
        address: profile.as_ref().and_then(|p| p.address.clone()),
        bio: profile.as_ref().and_then(|p| p.bio.clone()),
        date_of_birth: profile
            .as_ref()
            .and_then(|p| p.date_of_birth.map(|d| d.date_naive().to_string())),
        provider_id: account.map(|a| a.provider_id).unwrap_or_default(),
        extra: profile
            .and_then(|p| p.extra)
            .unwrap_or_else(|| json!({})),
        role: user.role,
        banned: user.banned,
        ban_reason: user.ban_reason,
        ban_expires: user.ban_expires.map(|d| d.to_rfc3339()),
    })
}
