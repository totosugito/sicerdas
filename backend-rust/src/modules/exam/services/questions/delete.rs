use crate::app::AppState;
use crate::db::entities::exam::{exam_package_questions, exam_questions};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::utils::sync_passage;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, TransactionTrait};
use uuid::Uuid;

pub async fn delete_question(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = exam_questions::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionsDeleteNotFound,
            ))
        })?;

    let in_use = exam_package_questions::Entity::find()
        .filter(exam_package_questions::Column::QuestionId.eq(id))
        .one(&state.db)
        .await?;
    if in_use.is_some() {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamQuestionsDeleteInUse,
        )));
    }

    let passage_id = existing.passage_id;
    let created_at = existing.created_at;

    let txn = state.db.begin().await?;
    exam_questions::Entity::delete_by_id(id).exec(&txn).await?;
    if let Some(pid) = passage_id {
        sync_passage(&txn, pid).await?;
    }
    txn.commit().await?;

    let storage = state.storage.clone();
    let id_str = id.to_string();
    tokio::spawn(async move {
        storage
            .delete_storage_directory("question", &id_str, created_at.into())
            .await;
    });

    Ok(())
}
