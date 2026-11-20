use crate::app::AppState;
use crate::db::entities::education_categories;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{CategoryData, CreateCategoryBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

fn slugify(s: &str) -> String {
    let mut out = String::new();
    let mut prev_dash = false;
    for ch in s.trim().to_lowercase().chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch);
            prev_dash = false;
        } else if !prev_dash && !out.is_empty() {
            out.push('-');
            prev_dash = true;
        }
    }
    out.trim_matches('-').to_string()
}

pub async fn create_category(
    state: &AppState,
    user_id: Uuid,
    body: CreateCategoryBody,
    locale: RequestLocale,
) -> Result<CategoryData, AppError> {
    let name = body.name.trim().to_string();
    if name.is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }
    let key = body
        .key
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_else(|| slugify(&name));

    let existing = education_categories::Entity::find()
        .filter(
            Condition::any()
                .add(education_categories::Column::Name.eq(&name))
                .add(education_categories::Column::Key.eq(&key)),
        )
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::EducationCategoriesCreateExists),
        ));
    }

    let now = Utc::now().fixed_offset();
    let inserted = education_categories::ActiveModel {
        id: Set(Uuid::new_v4()),
        name: Set(name),
        key: Set(key),
        description: Set(body.description),
        created_by_user_id: Set(Some(user_id)),
        is_active: Set(body.is_active.unwrap_or(true)),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&state.db)
    .await?;

    Ok(CategoryData::from(inserted))
}
