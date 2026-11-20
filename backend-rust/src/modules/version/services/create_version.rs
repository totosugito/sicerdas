use crate::app::AppState;
use crate::db::entities::app_version::{self, ContentStatus};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::version::types::{CreateVersionBody, VersionItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde_json::json;

pub async fn create_version(
    state: &AppState,
    body: CreateVersionBody,
    locale: RequestLocale,
) -> Result<VersionItem, AppError> {
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("Version name is required".to_string()));
    }

    let existing = app_version::Entity::find()
        .filter(app_version::Column::AppVersion.eq(body.app_version))
        .filter(app_version::Column::DbVersion.eq(body.db_version))
        .filter(app_version::Column::DataType.eq(body.data_type.clone()))
        .one(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::VersionCreateExists),
        ));
    }

    let now = Utc::now().fixed_offset();
    let inserted = app_version::ActiveModel {
        app_version: Set(body.app_version),
        db_version: Set(body.db_version),
        data_type: Set(body.data_type),
        status: Set(body.status.unwrap_or(ContentStatus::Unpublished)),
        name: Set(Some(body.name)),
        note: Set(json!(body.note.unwrap_or_default())),
        extra: Set(Some(body.extra.unwrap_or_else(|| json!({})))),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    }
    .insert(&state.db)
    .await?;

    Ok(VersionItem::from(inserted))
}
