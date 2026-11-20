use crate::app::AppState;
use crate::db::entities::users::UserRole;
use crate::db::entities::users_stats::StatsPeriodType;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Datelike, Utc};
use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use image::DynamicImage;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::io::Cursor;
use uuid::Uuid;

pub const MAX_AVATAR_BYTES: usize = 2 * 1024 * 1024;

#[derive(Debug, Clone)]
pub struct UploadedFile {
    pub bytes: Vec<u8>,
    pub content_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserResponseItem {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub role: UserRole,
    pub banned: bool,
    pub ban_reason: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProfileData {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub email_verified: bool,
    pub school: Option<String>,
    pub education_level: Option<String>,
    pub grade: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub bio: Option<String>,
    pub date_of_birth: Option<String>,
    pub provider_id: String,
    pub extra: Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserDetailsData {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub email_verified: bool,
    pub school: Option<String>,
    pub education_level: Option<String>,
    pub grade: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub bio: Option<String>,
    pub date_of_birth: Option<String>,
    pub provider_id: String,
    pub extra: Value,
    pub role: UserRole,
    pub banned: bool,
    pub ban_reason: Option<String>,
    pub ban_expires: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AvatarResponseData {
    pub id: Uuid,
    pub name: String,
    pub image: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionItem {
    pub id: Uuid,
    pub expires_at: String,
    pub created_at: String,
    pub updated_at: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangePasswordBody {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevokeOtherSessionsBody {
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevokeSessionBody {
    pub session_token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserBody {
    pub name: String,
    pub email: String,
    pub role: Option<UserRole>,
    pub password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserData {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub role: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUserBody {
    pub id: Uuid,
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: Option<UserRole>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BanUserBody {
    pub id: Uuid,
    pub banned: bool,
    pub ban_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResetPasswordBody {
    pub id: Uuid,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BulkDeleteUsersBody {
    pub ids: Vec<Uuid>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListUsersBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub search: Option<String>,
    pub roles: Option<Vec<UserRole>>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListUsersData {
    pub items: Vec<UserResponseItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetUserStatsQuery {
    pub period_type: Option<StatsPeriodType>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsItem {
    pub id: Uuid,
    pub period_type: String,
    pub period_key: String,
    pub date: String,
    pub new_users_count: i32,
    pub total_users_count: i32,
    pub active_users_count: i32,
    pub banned_users_count: i32,
    pub role_breakdown: Value,
    pub tier_breakdown: Value,
    pub education_breakdown: Value,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsKpi {
    pub total_users: i32,
    pub active_users: i32,
    pub banned_users: i32,
    pub role_breakdown: Value,
    pub tier_breakdown: Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsData {
    pub kpi: UserStatsKpi,
    pub history: Vec<UserStatsItem>,
}

pub fn validate_avatar_file(file: &UploadedFile, locale: RequestLocale) -> Result<(), AppError> {
    let allowed = ["image/jpeg", "image/png", "image/webp"];
    if !allowed.contains(&file.content_type.as_str()) {
        return Err(AppError::BadRequest(locale.t(LocaleKey::UserInvalidFileType)));
    }
    if file.bytes.len() > MAX_AVATAR_BYTES {
        return Err(AppError::BadRequest(locale.t(LocaleKey::UserFileSizeTooLarge)));
    }
    Ok(())
}

pub async fn process_and_save_avatar(
    state: &AppState,
    user_id: Uuid,
    created_at: DateTime<Utc>,
    old_image: Option<&str>,
    file: &UploadedFile,
    locale: RequestLocale,
) -> Result<String, AppError> {
    validate_avatar_file(file, locale)?;

    if let Some(old_path) = old_image {
        if !old_path.starts_with("http://") && !old_path.starts_with("https://") {
            state.storage.delete_file(old_path).await;
        }
    }

    let raw_bytes = file.bytes.clone();
    let encoded = tokio::task::spawn_blocking(move || -> Result<Vec<u8>, String> {
        let img = image::load_from_memory(&raw_bytes).map_err(|e| e.to_string())?;
        let resized: DynamicImage = if img.width() > 400 {
            let new_h = ((img.height() as u64 * 400) / img.width() as u64).max(1) as u32;
            img.resize(400, new_h, FilterType::Triangle)
        } else {
            img
        };
        let mut out = Cursor::new(Vec::new());
        let mut encoder = JpegEncoder::new_with_quality(&mut out, 90);
        encoder
            .encode_image(&resized.to_rgb8())
            .map_err(|e| e.to_string())?;
        Ok(out.into_inner())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map_err(|e| AppError::BadRequest(format!("Invalid image: {e}")))?;

    let year_month = format!("{:04}-{:02}", created_at.year(), created_at.month());
    let file_name = format!("{}-avatar.jpg", Uuid::new_v4());
    let relative_path = format!("users/{year_month}/{user_id}/{file_name}");

    state
        .storage
        .save_file(&relative_path, encoded, "image/jpeg")
        .await?;

    Ok(relative_path)
}
