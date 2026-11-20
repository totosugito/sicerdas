use crate::app::AppState;
use crate::db::entities::ai_models;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::ai::types::{ModelCreateBody, ModelResponseItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde_json::json;
use uuid::Uuid;

pub async fn create_model(
    state: &AppState,
    body: ModelCreateBody,
    locale: RequestLocale,
) -> Result<ModelResponseItem, AppError> {
    let ident = body.model_identifier.trim().to_string();
    if body.name.trim().is_empty() || body.provider.trim().is_empty() || ident.is_empty() {
        return Err(AppError::BadRequest(
            "name, provider, and modelIdentifier are required".to_string(),
        ));
    }

    let existing = ai_models::Entity::find()
        .filter(ai_models::Column::ModelIdentifier.eq(&ident))
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::ChatAiModelCreateExists),
        ));
    }

    let now = Utc::now().fixed_offset();
    let inserted = ai_models::ActiveModel {
        id: Set(Uuid::new_v4()),
        name: Set(body.name.trim().to_string()),
        provider: Set(body.provider.trim().to_string()),
        model_identifier: Set(ident),
        api_key: Set(body.api_key),
        description: Set(body.description),
        max_tokens: Set(body.max_tokens),
        supports_image: Set(body.supports_image.unwrap_or(false)),
        supports_file: Set(body.supports_file.unwrap_or(false)),
        accepted_image_extensions: Set(body.accepted_image_extensions.map(|v| json!(v)).or_else(|| {
            Some(json!([".jpg", ".jpeg", ".png", ".webp"]))
        })),
        accepted_file_extensions: Set(body.accepted_file_extensions.map(|v| json!(v)).or_else(|| {
            Some(json!([".pdf", ".txt", ".csv", ".docx"]))
        })),
        max_file_size: Set(body.max_file_size),
        tier_capabilities: Set(Some(body.tier_capabilities.unwrap_or_else(|| json!({})))),
        extra: Set(Some(body.extra.unwrap_or_else(|| json!({})))),
        is_default: Set(body.is_default.unwrap_or(false)),
        is_enabled: Set(body.is_enabled.unwrap_or(true)),
        required_tier_id: Set(body.required_tier_id),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&state.db)
    .await?;

    Ok(ModelResponseItem::from(inserted))
}
