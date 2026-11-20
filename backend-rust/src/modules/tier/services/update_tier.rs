use crate::app::AppState;
use crate::db::entities::app_tier;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::tier::services::list_app_tier::CACHE_KEY_APP_TIERS;
use crate::modules::tier::services::list_tiers::CACHE_KEY_ADMIN_TIERS;
use crate::modules::tier::types::{TierItem, UpdateTierBody};
use chrono::Utc;
use sea_orm::prelude::Decimal;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde_json::json;
use std::str::FromStr;

pub async fn update_tier(
    state: &AppState,
    slug: &str,
    body: UpdateTierBody,
    locale: RequestLocale,
) -> Result<TierItem, AppError> {
    let existing = app_tier::Entity::find_by_id(slug.to_string())
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::AppTierUpdateNotFound)))?;

    let mut active: app_tier::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name);
    }
    if let Some(price_str) = body.price {
        let price = Decimal::from_str(price_str.trim())
            .map_err(|_| AppError::BadRequest("Invalid price".to_string()))?;
        active.price = Set(price);
    }
    if let Some(currency) = body.currency {
        active.currency = Set(currency);
    }
    if let Some(billing_cycle) = body.billing_cycle {
        active.billing_cycle = Set(billing_cycle);
    }
    if let Some(features) = body.features {
        active.features = Set(Some(json!(features)));
    }
    if let Some(limits) = body.limits {
        active.limits = Set(Some(limits));
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    if let Some(sort_order) = body.sort_order {
        active.sort_order = Set(sort_order);
    }
    if let Some(is_popular) = body.is_popular {
        active.is_popular = Set(is_popular);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active.update(&state.db).await?;

    state.read_cache.invalidate(CACHE_KEY_APP_TIERS).await;
    state.read_cache.invalidate(CACHE_KEY_ADMIN_TIERS).await;

    Ok(TierItem::from(updated))
}
