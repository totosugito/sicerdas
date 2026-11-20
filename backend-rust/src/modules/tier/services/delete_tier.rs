use crate::app::AppState;
use crate::db::entities::{ai_models, app_tier, users_profiles};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::tier::services::list_app_tier::CACHE_KEY_APP_TIERS;
use crate::modules::tier::services::list_tiers::CACHE_KEY_ADMIN_TIERS;
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter};

pub async fn delete_tier(
    state: &AppState,
    slug: &str,
    locale: RequestLocale,
) -> Result<(), AppError> {
    if matches!(slug, "free" | "pro" | "enterprise") {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::AppTierDeleteDefaultData),
        ));
    }

    let _existing = app_tier::Entity::find_by_id(slug.to_string())
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::AppTierDeleteNotFound)))?;

    let user_count = users_profiles::Entity::find()
        .filter(users_profiles::Column::TierId.eq(slug))
        .count(&state.db)
        .await?;
    if user_count > 0 {
        return Err(AppError::BadRequest(
            locale
                .t(LocaleKey::AppTierDeleteUsedByUsers)
                .replace("{{count}}", &user_count.to_string()),
        ));
    }

    let model_count = ai_models::Entity::find()
        .filter(ai_models::Column::RequiredTierId.eq(slug))
        .count(&state.db)
        .await?;
    if model_count > 0 {
        return Err(AppError::BadRequest(
            locale
                .t(LocaleKey::AppTierDeleteUsedByModels)
                .replace("{{count}}", &model_count.to_string()),
        ));
    }

    app_tier::Entity::delete_by_id(slug.to_string())
        .exec(&state.db)
        .await?;

    state.read_cache.invalidate(CACHE_KEY_APP_TIERS).await;
    state.read_cache.invalidate(CACHE_KEY_ADMIN_TIERS).await;

    Ok(())
}
