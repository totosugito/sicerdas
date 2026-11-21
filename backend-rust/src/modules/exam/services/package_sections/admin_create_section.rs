use crate::app::AppState;
use crate::db::entities::exam::{exam_package_sections, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::CreateSectionBody;
use crate::modules::exam::utils::sync_package;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, Set, TransactionTrait,
};
use uuid::Uuid;

pub async fn admin_create_section(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: CreateSectionBody,
) -> Result<Uuid, AppError> {
    if exam_packages::Entity::find_by_id(body.package_id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .is_none()
    {
        return Err(AppError::NotFound(translate(lang, LocaleKey::ExamPackagesUpdateNotFound)));
    }

    let order_to_use = match body.order {
        Some(o) if o >= 0 => o,
        _ => {
            let count = exam_package_sections::Entity::find()
                .filter(exam_package_sections::Column::PackageId.eq(body.package_id))
                .count(&state.db)
                .await
                .map_err(|e| AppError::Internal(e.to_string()))?;
            (count as i32) + 1
        }
    };

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let now = Utc::now().fixed_offset();
    let created = exam_package_sections::ActiveModel {
        id: Set(Uuid::new_v4()),
        package_id: Set(body.package_id),
        title: Set(body.title),
        group_name: Set(body.group_name),
        description: Set(body.description),
        duration_minutes: Set(body.duration_minutes.unwrap_or(0)),
        order: Set(order_to_use),
        is_active: Set(body.is_active.unwrap_or(true)),
        version_id: Set(body.version_id),
        created_by_user_id: Set(Some(user_id)),
        question_limit: Set(body.question_limit.unwrap_or(0)),
        is_random_item: Set(body.is_random_item.unwrap_or(true)),
        is_random_choice: Set(body.is_random_choice.unwrap_or(true)),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    sync_package(&txn, body.package_id).await?;

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(created.id)
}
