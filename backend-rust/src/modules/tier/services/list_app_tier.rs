use crate::app::AppState;
use crate::db::entities::app_tier;
use crate::error::AppError;
use crate::modules::tier::types::TierItem;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};

pub const CACHE_KEY_APP_TIERS: &str = "tier:app";

pub async fn list_app_tiers(state: &AppState) -> Result<Vec<TierItem>, AppError> {
    if let Some(cached) = state.read_cache.get(CACHE_KEY_APP_TIERS).await {
        if let Ok(items) = serde_json::from_value::<Vec<TierItem>>(cached) {
            return Ok(items);
        }
    }

    let rows = app_tier::Entity::find()
        .filter(app_tier::Column::IsActive.eq(true))
        .order_by_asc(app_tier::Column::SortOrder)
        .all(&state.db)
        .await?;

    let items: Vec<TierItem> = rows.into_iter().map(TierItem::from).collect();
    if let Ok(val) = serde_json::to_value(&items) {
        state
            .read_cache
            .insert(CACHE_KEY_APP_TIERS.to_string(), val)
            .await;
    }
    Ok(items)
}
