use crate::app::AppState;
use crate::db::entities::exam::{exam_package_sections, exam_sessions};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::utils::sync_package;
use sea_orm::{ColumnTrait, EntityTrait, ModelTrait, QueryFilter, TransactionTrait};
use uuid::Uuid;

pub async fn admin_delete_section(state: &AppState,
    lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = exam_package_sections::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackageSectionsDeleteNotFound)))?;

    let in_use = exam_sessions::Entity::find()
        .filter(exam_sessions::Column::SectionId.eq(id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if in_use.is_some() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::ExamPackageSectionsDeleteInUse)));
    }

    let pkg_id = existing.package_id;
    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    existing
        .delete(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    sync_package(&txn, pkg_id).await?;

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(())
}
