use crate::app::AppState;
use crate::db::entities::users_profiles::EducationLevel;
use crate::db::entities::{users, users_accounts, users_profiles};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::auth::services::session::resolve_avatar_url;
use crate::modules::users::types::{process_and_save_avatar, UploadedFile, UserProfileData};
use chrono::{FixedOffset, NaiveDate, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Default)]
pub struct UpdateProfileParams {
    pub user_id: Uuid,
    pub name: Option<String>,
    pub school: Option<String>,
    pub education_level: Option<String>,
    pub grade: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub bio: Option<String>,
    pub date_of_birth: Option<String>,
    pub extra: Option<String>,
    pub file: Option<UploadedFile>,
}

pub async fn update_profile(
    state: &AppState,
    session_token: &str,
    params: UpdateProfileParams,
    locale: RequestLocale,
) -> Result<UserProfileData, AppError> {
    let parsed_dob: Option<Option<chrono::DateTime<FixedOffset>>> =
        params.date_of_birth.as_ref().map(|s| {
            NaiveDate::parse_from_str(s.trim(), "%Y-%m-%d")
                .ok()
                .and_then(|d| d.and_hms_opt(0, 0, 0))
                .map(|dt| chrono::DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc).fixed_offset())
        });

    let parsed_extra: Option<Value> = params
        .extra
        .as_ref()
        .and_then(|s| serde_json::from_str::<Value>(s).ok());

    let has_user_updates = params.name.is_some() || params.file.is_some();
    let has_profile_updates = params.school.is_some()
        || params.education_level.is_some()
        || params.grade.is_some()
        || params.phone.is_some()
        || params.address.is_some()
        || params.bio.is_some()
        || parsed_dob.is_some()
        || parsed_extra.is_some();

    if !has_user_updates && !has_profile_updates {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::UserNoValidUpdateData),
        ));
    }

    let user = users::Entity::find_by_id(params.user_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserUserNotFound)))?;

    let new_image_path = if let Some(file) = &params.file {
        Some(
            process_and_save_avatar(
                state,
                params.user_id,
                user.created_at.with_timezone(&Utc),
                user.image.as_deref(),
                file,
                locale,
            )
            .await?,
        )
    } else {
        None
    };

    let now = Utc::now().fixed_offset();
    let txn = state.db.begin().await?;

    let updated_user = if has_user_updates {
        let mut active: users::ActiveModel = user.clone().into();
        if let Some(name) = params.name {
            active.name = Set(name);
        }
        if let Some(img) = new_image_path {
            active.image = Set(Some(img));
        }
        active.updated_at = Set(now);
        active.update(&txn).await?
    } else {
        user
    };

    let existing_profile = users_profiles::Entity::find_by_id(params.user_id)
        .one(&txn)
        .await?;

    let updated_profile = if let Some(prof) = existing_profile {
        if has_profile_updates {
            let mut active: users_profiles::ActiveModel = prof.into();
            if let Some(school) = params.school {
                active.school = Set(Some(school));
            }
            if let Some(lvl) = params.education_level {
                active.education_level = Set(EducationLevel::from_str_opt(&lvl));
            }
            if let Some(grade) = params.grade {
                active.grade = Set(Some(grade));
            }
            if let Some(phone) = params.phone {
                active.phone = Set(Some(phone));
            }
            if let Some(address) = params.address {
                active.address = Set(Some(address));
            }
            if let Some(bio) = params.bio {
                active.bio = Set(Some(bio));
            }
            if let Some(dob) = parsed_dob {
                active.date_of_birth = Set(dob);
            }
            if let Some(extra) = parsed_extra {
                active.extra = Set(Some(extra));
            }
            active.updated_at = Set(now);
            Some(active.update(&txn).await?)
        } else {
            Some(prof)
        }
    } else if has_profile_updates {
        let active = users_profiles::ActiveModel {
            id: Set(params.user_id),
            school: Set(params.school),
            education_level: Set(params
                .education_level
                .as_deref()
                .and_then(EducationLevel::from_str_opt)),
            grade: Set(params.grade),
            phone: Set(params.phone),
            address: Set(params.address),
            bio: Set(params.bio),
            date_of_birth: Set(parsed_dob.flatten()),
            tier_id: Set(Some("free".to_string())),
            extra: Set(Some(parsed_extra.unwrap_or_else(|| json!({})))),
            created_at: Set(now),
            updated_at: Set(now),
        };
        Some(active.insert(&txn).await?)
    } else {
        None
    };

    txn.commit().await?;
    state.session_cache.invalidate(session_token).await;

    let account = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(params.user_id))
        .one(&state.db)
        .await?;

    let image = resolve_avatar_url(&state.config, updated_user.image.as_deref());

    Ok(UserProfileData {
        id: updated_user.id,
        email: updated_user.email,
        name: updated_user.name,
        image,
        created_at: updated_user.created_at.to_rfc3339(),
        updated_at: updated_user.updated_at.to_rfc3339(),
        email_verified: updated_user.email_verified,
        school: updated_profile.as_ref().and_then(|p| p.school.clone()),
        education_level: updated_profile
            .as_ref()
            .and_then(|p| p.education_level.as_ref().map(|e| e.as_str().to_string())),
        grade: updated_profile.as_ref().and_then(|p| p.grade.clone()),
        phone: updated_profile.as_ref().and_then(|p| p.phone.clone()),
        address: updated_profile.as_ref().and_then(|p| p.address.clone()),
        bio: updated_profile.as_ref().and_then(|p| p.bio.clone()),
        date_of_birth: updated_profile
            .as_ref()
            .and_then(|p| p.date_of_birth.map(|d| d.date_naive().to_string())),
        provider_id: account.map(|a| a.provider_id).unwrap_or_default(),
        extra: updated_profile
            .and_then(|p| p.extra)
            .unwrap_or_else(|| json!({})),
    })
}
