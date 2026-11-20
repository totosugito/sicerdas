use crate::app::AppState;
use crate::db::entities::app_tier;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::tier::services::list_app_tier::CACHE_KEY_APP_TIERS;
use crate::modules::tier::services::list_tiers::CACHE_KEY_ADMIN_TIERS;
use crate::modules::tier::types::{CreateTierBody, TierItem};
use chrono::Utc;
use sea_orm::prelude::Decimal;
use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, EntityTrait, QueryFilter, Set};
use serde_json::json;
use std::str::FromStr;

pub async fn create_tier(
    state: &AppState,
    body: CreateTierBody,
    locale: RequestLocale,
) -> Result<TierItem, AppError> {
    let slug = body.slug.trim().to_string();
    let name = body.name.trim().to_string();

    if slug.len() < 4 || name.len() < 4 {
        return Err(AppError::BadRequest(
            "Slug and name must be at least 4 characters".to_string(),
        ));
    }

    let existing = app_tier::Entity::find()
        .filter(
            Condition::any()
                .add(app_tier::Column::Slug.eq(&slug))
                .add(app_tier::Column::Name.eq(&name)),
        )
        .one(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::AppTierCreateExists),
        ));
    }

    let price = Decimal::from_str(body.price.trim())
        .map_err(|_| AppError::BadRequest("Invalid price".to_string()))?;

    let now = Utc::now().fixed_offset();
    let inserted = app_tier::ActiveModel {
        slug: Set(slug),
        name: Set(name),
        price: Set(price),
        currency: Set(body.currency.unwrap_or_else(|| "USD".to_string())),
        billing_cycle: Set(body.billing_cycle.unwrap_or_else(|| "monthly".to_string())),
        features: Set(Some(json!(body.features.unwrap_or_default()))),
        limits: Set(Some(body.limits.unwrap_or_else(|| json!({})))),
        is_active: Set(body.is_active.unwrap_or(true)),
        sort_order: Set(body.sort_order.unwrap_or(-1)),
        is_popular: Set(body.is_popular.unwrap_or(false)),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&state.db)
    .await?;

    state.read_cache.invalidate(CACHE_KEY_APP_TIERS).await;
    state.read_cache.invalidate(CACHE_KEY_ADMIN_TIERS).await;

    Ok(TierItem::from(inserted))
}
