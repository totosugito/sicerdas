use crate::app::AppState;
use crate::db::entities::exam::exam_package_questions;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::SyncPackageQuestionsOrderBody;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};

pub async fn admin_sync_order(
    state: &AppState,
    body: SyncPackageQuestionsOrderBody,
) -> Result<(), AppError> {
    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    for item in body.updates {
        exam_package_questions::Entity::update_many()
            .col_expr(
                exam_package_questions::Column::Order,
                sea_orm::sea_query::Expr::value(item.order),
            )
            .filter(exam_package_questions::Column::PackageId.eq(body.package_id))
            .filter(exam_package_questions::Column::SectionId.eq(body.section_id))
            .filter(exam_package_questions::Column::QuestionId.eq(item.question_id))
            .exec(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    let _ = Set(0); // keep import clean if unused
    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(())
}
