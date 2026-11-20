use crate::app::AppState;
use crate::db::entities::app_tier;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::tier::types::TierItem;
use sea_orm::EntityTrait;

pub async fn get_tier(
    state: &AppState,
    slug: &str,
    locale: RequestLocale,
) -> Result<TierItem, AppError> {
    let row = app_tier::Entity::find_by_id(slug.to_string())
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::AppTierDetailsNotFound)))?;

    Ok(TierItem::from(row))
}
