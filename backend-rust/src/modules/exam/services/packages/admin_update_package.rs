use crate::app::AppState;
use crate::db::entities::education::{education_categories, education_grades};
use crate::db::entities::exam::enums::ExamType;
use crate::db::entities::exam::exam_packages;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::services::packages::admin_create_package::recalculate_exam_education_stats;
use crate::modules::exam::types::UpdatePackageBody;
use crate::modules::exam::utils::parse_exam_type;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn admin_update_package(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdatePackageBody,
) -> Result<(), AppError> {
    let existing = exam_packages::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesUpdateNotFound)))?;

    if let Some(cat_id) = body.category_id {
        if education_categories::Entity::find_by_id(cat_id)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
            .is_none()
        {
            return Err(AppError::NotFound(translate(
                lang,
                LocaleKey::EducationCategoriesUpdateNotFound,
            )));
        }
    }

    if let Some(grade_id) = body.education_grade_id {
        if education_grades::Entity::find_by_id(grade_id)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
            .is_none()
        {
            return Err(AppError::NotFound(translate(
                lang,
                LocaleKey::EducationGradesUpdateNotFound,
            )));
        }
    }

    let old_cat = existing.category_id;
    let old_grade = existing.education_grade_id;
    let old_type = existing.exam_type.clone();
    let old_active = existing.is_active;

    let mut active: exam_packages::ActiveModel = existing.into();
    if let Some(cat_id) = body.category_id {
        active.category_id = Set(cat_id);
    }
    if let Some(title) = body.title {
        active.title = Set(title);
    }
    if let Some(ref exam_type) = body.exam_type {
        active.exam_type = Set(parse_exam_type(exam_type));
    }
    if body.description.is_some() {
        active.description = Set(body.description);
    }
    if body.required_tier.is_some() {
        active.required_tier = Set(body.required_tier);
    }
    if body.education_grade_id.is_some() {
        active.education_grade_id = Set(body.education_grade_id);
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    if body.version_id.is_some() {
        active.version_id = Set(body.version_id);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active
        .update(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let changed = updated.category_id != old_cat
        || updated.education_grade_id != old_grade
        || updated.exam_type != old_type
        || updated.is_active != old_active;

    if changed {
        if old_type == ExamType::Official {
            if let Some(g) = old_grade {
                recalculate_exam_education_stats(state, old_cat, g).await;
            }
        }
        if updated.exam_type == ExamType::Official {
            if let Some(g) = updated.education_grade_id {
                recalculate_exam_education_stats(state, updated.category_id, g).await;
            }
        }
    }

    Ok(())
}
