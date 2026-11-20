use crate::app::AppState;
use crate::db::entities::education_grades;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{GradeData, UpdateGradeBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

pub async fn update_grade(
    state: &AppState,
    id: i32,
    body: UpdateGradeBody,
    locale: RequestLocale,
) -> Result<GradeData, AppError> {
    let existing = education_grades::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::EducationGradesUpdateNotFound)))?;

    if let Some(ref name) = body.name {
        let trimmed = name.trim();
        if trimmed != existing.name {
            let dup = education_grades::Entity::find()
                .filter(education_grades::Column::Name.eq(trimmed))
                .filter(education_grades::Column::Id.ne(id))
                .one(&state.db)
                .await?;
            if dup.is_some() {
                return Err(AppError::BadRequest(
                    locale.t(LocaleKey::EducationGradesUpdateExists),
                ));
            }
        }
    }

    let mut active: education_grades::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name.trim().to_string());
    }
    if let Some(desc) = body.desc {
        active.desc = Set(Some(desc));
    }
    if let Some(extra) = body.extra {
        active.extra = Set(Some(extra));
    }
    if let Some(is_default) = body.is_default {
        active.is_default = Set(Some(is_default));
    }
    active.updated_at = Set(Some(Utc::now().fixed_offset()));

    let updated = active.update(&state.db).await?;
    Ok(GradeData::from(updated))
}
