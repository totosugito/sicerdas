use crate::app::AppState;
use crate::db::entities::app_version;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::version::types::VersionItem;
use sea_orm::EntityTrait;

pub async fn get_version_detail(
    state: &AppState,
    id: i32,
    locale: RequestLocale,
) -> Result<VersionItem, AppError> {
    let row = app_version::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::VersionNotFound)))?;

    Ok(VersionItem::from(row))
}
