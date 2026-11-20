use crate::app::AppState;
use crate::db::entities::education_categories;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{CategoryData, UpdateCategoryBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn update_category(
    state: &AppState,
    id: Uuid,
    body: UpdateCategoryBody,
    locale: RequestLocale,
) -> Result<CategoryData, AppError> {
    let existing = education_categories::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locale.t(LocaleKey::EducationCategoriesUpdateNotFound))
        })?;

    let name = body.name.trim().to_string();
    if name != existing.name {
        let dup = education_categories::Entity::find()
            .filter(education_categories::Column::Name.eq(&name))
            .filter(education_categories::Column::Id.ne(id))
            .one(&state.db)
            .await?;
        if dup.is_some() {
            return Err(AppError::BadRequest(
                locale.t(LocaleKey::EducationCategoriesUpdateExists),
            ));
        }
    }

    let mut active: education_categories::ActiveModel = existing.into();
    active.name = Set(name);
    if let Some(key) = body.key {
        active.key = Set(key.trim().to_string());
    }
    if let Some(desc) = body.description {
        active.description = Set(Some(desc));
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active.update(&state.db).await?;
    Ok(CategoryData::from(updated))
}
