use crate::app::AppState;
use crate::db::entities::app_version;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::version::types::{UpdateVersionBody, VersionItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde_json::json;

pub async fn update_version(
    state: &AppState,
    id: i32,
    body: UpdateVersionBody,
    locale: RequestLocale,
) -> Result<VersionItem, AppError> {
    let existing = app_version::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::VersionNotFound)))?;

    let mut active: app_version::ActiveModel = existing.into();
    if let Some(app_v) = body.app_version {
        active.app_version = Set(app_v);
    }
    if let Some(db_v) = body.db_version {
        active.db_version = Set(db_v);
    }
    if let Some(status) = body.status {
        active.status = Set(status);
    }
    if let Some(name) = body.name {
        active.name = Set(Some(name));
    }
    if let Some(note) = body.note {
        active.note = Set(json!(note));
    }
    if let Some(extra) = body.extra {
        active.extra = Set(Some(extra));
    }
    active.updated_at = Set(Some(Utc::now().fixed_offset()));

    let updated = active.update(&state.db).await?;
    Ok(VersionItem::from(updated))
}
