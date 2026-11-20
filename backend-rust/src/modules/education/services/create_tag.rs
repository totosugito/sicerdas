use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{CreateTagBody, TagData};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn create_tag(
    state: &AppState,
    user_id: Uuid,
    body: CreateTagBody,
    locale: RequestLocale,
) -> Result<TagData, AppError> {
    let name = body.name.trim().to_string();
    if name.is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }

    let existing = education_tags::Entity::find()
        .filter(education_tags::Column::Name.eq(&name))
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::EducationTagsCreateExists),
        ));
    }

    let now = Utc::now().fixed_offset();
    let inserted = education_tags::ActiveModel {
        id: Set(Uuid::new_v4()),
        name: Set(name),
        description: Set(body.description),
        is_active: Set(body.is_active.unwrap_or(true)),
        created_by_user_id: Set(Some(user_id)),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&state.db)
    .await?;

    Ok(TagData {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description,
        is_active: inserted.is_active,
        total_questions: 0,
        created_at: inserted.created_at.to_rfc3339(),
        updated_at: inserted.updated_at.to_rfc3339(),
    })
}
