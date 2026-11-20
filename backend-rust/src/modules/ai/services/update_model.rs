use crate::app::AppState;
use crate::db::entities::ai_models;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::ai::types::{ModelResponseItem, ModelUpdateBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde_json::json;
use uuid::Uuid;

pub async fn update_model(
    state: &AppState,
    id: Uuid,
    body: ModelUpdateBody,
    locale: RequestLocale,
) -> Result<ModelResponseItem, AppError> {
    let existing = ai_models::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::ChatAiModelDetailNotFound)))?;

    if let Some(ident) = body.model_identifier.as_deref().map(str::trim) {
        if ident != existing.model_identifier {
            let dup = ai_models::Entity::find()
                .filter(ai_models::Column::ModelIdentifier.eq(ident))
                .one(&state.db)
                .await?;
            if dup.is_some() {
                return Err(AppError::BadRequest(
                    locale.t(LocaleKey::ChatAiModelCreateExists),
                ));
            }
        }
    }

    let mut active: ai_models::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name);
    }
    if let Some(provider) = body.provider {
        active.provider = Set(provider);
    }
    if let Some(ident) = body.model_identifier {
        active.model_identifier = Set(ident);
    }
    if let Some(api_key) = body.api_key {
        active.api_key = Set(Some(api_key));
    }
    if let Some(desc) = body.description {
        active.description = Set(Some(desc));
    }
    if let Some(max_tokens) = body.max_tokens {
        active.max_tokens = Set(Some(max_tokens));
    }
    if let Some(supports_image) = body.supports_image {
        active.supports_image = Set(supports_image);
    }
    if let Some(supports_file) = body.supports_file {
        active.supports_file = Set(supports_file);
    }
    if let Some(ext) = body.accepted_image_extensions {
        active.accepted_image_extensions = Set(Some(json!(ext)));
    }
    if let Some(ext) = body.accepted_file_extensions {
        active.accepted_file_extensions = Set(Some(json!(ext)));
    }
    if let Some(max_fs) = body.max_file_size {
        active.max_file_size = Set(Some(max_fs));
    }
    if let Some(is_default) = body.is_default {
        active.is_default = Set(is_default);
    }
    if let Some(is_enabled) = body.is_enabled {
        active.is_enabled = Set(is_enabled);
    }
    if let Some(req_tier) = body.required_tier_id {
        active.required_tier_id = Set(Some(req_tier));
    }
    if let Some(tc) = body.tier_capabilities {
        active.tier_capabilities = Set(Some(tc));
    }
    if let Some(extra) = body.extra {
        active.extra = Set(Some(extra));
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active.update(&state.db).await?;
    Ok(ModelResponseItem::from(updated))
}
