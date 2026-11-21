use crate::app::AppState;
use crate::db::entities::exam::exam_package_questions;
use crate::error::AppError;
use crate::modules::exam::types::{AssignPackageQuestionsBody, AssignPackageQuestionsData};
use crate::modules::exam::utils::{sync_package, sync_section};
use sea_orm::{
    ColumnTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, Set, Statement,
    TransactionTrait, Value,
};
use std::collections::HashSet;

#[derive(Debug, FromQueryResult)]
struct MaxOrderRow {
    max_order: Option<i32>,
}

pub async fn admin_assign(
    state: &AppState,
    body: AssignPackageQuestionsBody,
) -> Result<AssignPackageQuestionsData, AppError> {
    if body.question_ids.is_empty() {
        return Ok(AssignPackageQuestionsData {
            total_assigned: 0,
            total_skipped: 0,
        });
    }

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let existing = exam_package_questions::Entity::find()
        .filter(exam_package_questions::Column::PackageId.eq(body.package_id))
        .filter(exam_package_questions::Column::QuestionId.is_in(body.question_ids.clone()))
        .all(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let existing_ids: HashSet<_> = existing.into_iter().map(|e| e.question_id).collect();
    let new_ids: Vec<_> = body
        .question_ids
        .into_iter()
        .filter(|id| !existing_ids.contains(id))
        .collect();

    let total_skipped = existing_ids.len();
    let total_assigned = new_ids.len();

    if !new_ids.is_empty() {
        let max_row = MaxOrderRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            SELECT MAX("order") AS max_order
            FROM exam_package_questions
            WHERE package_id = $1 AND section_id = $2
            "#,
            vec![
                Value::Uuid(Some(Box::new(body.package_id))),
                Value::Uuid(Some(Box::new(body.section_id))),
            ],
        ))
        .one(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut next_order = max_row.and_then(|r| r.max_order).unwrap_or(0) + 1;

        let models: Vec<exam_package_questions::ActiveModel> = new_ids
            .into_iter()
            .map(|qid| {
                let order = next_order;
                next_order += 1;
                exam_package_questions::ActiveModel {
                    package_id: Set(body.package_id),
                    section_id: Set(body.section_id),
                    question_id: Set(qid),
                    order: Set(order),
                }
            })
            .collect();

        exam_package_questions::Entity::insert_many(models)
            .exec(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        sync_package(&txn, body.package_id).await?;
        sync_section(&txn, body.section_id).await?;
    }

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(AssignPackageQuestionsData {
        total_assigned,
        total_skipped,
    })
}
