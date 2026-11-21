use crate::app::AppState;
use crate::db::entities::exam::enums::ExamType;
use crate::db::entities::exam::{exam_packages, exam_sessions};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::services::packages::admin_create_package::recalculate_exam_education_stats;
use sea_orm::{ColumnTrait, EntityTrait, ModelTrait, QueryFilter};
use uuid::Uuid;

pub async fn admin_delete_package(state: &AppState,
    lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = exam_packages::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDeleteNotFound)))?;

    let in_use = exam_sessions::Entity::find()
        .filter(exam_sessions::Column::PackageId.eq(id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if in_use.is_some() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesDeleteInUse)));
    }

    let old_thumb = existing.thumbnail.clone();
    let old_type = existing.exam_type.clone();
    let old_cat = existing.category_id;
    let old_grade = existing.education_grade_id;

    existing
        .delete(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(thumb) = old_thumb {
        state.storage.delete_file(&thumb).await;
    }

    if old_type == ExamType::Official {
        if let Some(grade_id) = old_grade {
            recalculate_exam_education_stats(state, old_cat, grade_id).await;
        }
    }

    Ok(())
}
