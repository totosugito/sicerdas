use crate::app::AppState;
use crate::db::entities::exam::{exam_package_sections, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::UpdateSectionBody;
use crate::modules::exam::utils::sync_package;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set, TransactionTrait};
use uuid::Uuid;

pub async fn admin_update_section(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdateSectionBody,
) -> Result<(), AppError> {
    let existing = exam_package_sections::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackageSectionsUpdateNotFound)))?;

    if let Some(pkg_id) = body.package_id {
        if exam_packages::Entity::find_by_id(pkg_id)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
            .is_none()
        {
            return Err(AppError::NotFound(translate(lang, LocaleKey::ExamPackagesUpdateNotFound)));
        }
    }

    let old_pkg_id = existing.package_id;
    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut active: exam_package_sections::ActiveModel = existing.into();
    if let Some(pkg_id) = body.package_id {
        active.package_id = Set(pkg_id);
    }
    if let Some(title) = body.title {
        active.title = Set(title);
    }
    if body.group_name.is_some() {
        active.group_name = Set(body.group_name);
    }
    if body.description.is_some() {
        active.description = Set(body.description);
    }
    if let Some(dur) = body.duration_minutes {
        active.duration_minutes = Set(dur);
    }
    if let Some(ord) = body.order {
        active.order = Set(ord);
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    if body.version_id.is_some() {
        active.version_id = Set(body.version_id);
    }
    if let Some(ql) = body.question_limit {
        active.question_limit = Set(ql);
    }
    if let Some(ri) = body.is_random_item {
        active.is_random_item = Set(ri);
    }
    if let Some(rc) = body.is_random_choice {
        active.is_random_choice = Set(rc);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active
        .update(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    sync_package(&txn, updated.package_id).await?;
    if updated.package_id != old_pkg_id {
        sync_package(&txn, old_pkg_id).await?;
    }

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(())
}
