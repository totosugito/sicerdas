use crate::app::AppState;
use crate::db::entities::exam::exam_package_questions;
use crate::error::AppError;
use crate::modules::exam::types::UnassignPackageQuestionsBody;
use crate::modules::exam::utils::{sync_package, sync_section};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, TransactionTrait};
use std::collections::HashSet;

pub async fn admin_unassign(
    state: &AppState,
    body: UnassignPackageQuestionsBody,
) -> Result<(), AppError> {
    if body.question_ids.is_empty() {
        return Ok(());
    }

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let assignments = exam_package_questions::Entity::find()
        .filter(exam_package_questions::Column::PackageId.eq(body.package_id))
        .filter(exam_package_questions::Column::QuestionId.is_in(body.question_ids.clone()))
        .all(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if !assignments.is_empty() {
        let section_ids: HashSet<_> = assignments.iter().map(|a| a.section_id).collect();

        exam_package_questions::Entity::delete_many()
            .filter(exam_package_questions::Column::PackageId.eq(body.package_id))
            .filter(exam_package_questions::Column::QuestionId.is_in(body.question_ids))
            .exec(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        sync_package(&txn, body.package_id).await?;
        for sec_id in section_ids {
            sync_section(&txn, sec_id).await?;
        }
    }

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(())
}
