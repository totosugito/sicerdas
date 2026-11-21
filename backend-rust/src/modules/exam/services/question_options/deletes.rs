use crate::app::AppState;
use crate::db::entities::exam::exam_question_options;
use crate::error::AppError;
use crate::modules::exam::utils::sync_question_max_score;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use std::collections::HashSet;
use uuid::Uuid;

pub async fn delete_multiple_question_options(
    state: &AppState,
    ids: Vec<Uuid>,
) -> Result<(), AppError> {
    if ids.is_empty() {
        return Ok(());
    }

    let existing = exam_question_options::Entity::find()
        .filter(exam_question_options::Column::Id.is_in(ids.clone()))
        .all(&state.db)
        .await?;

    let question_ids: HashSet<Uuid> = existing.into_iter().map(|o| o.question_id).collect();

    exam_question_options::Entity::delete_many()
        .filter(exam_question_options::Column::Id.is_in(ids))
        .exec(&state.db)
        .await?;

    for qid in question_ids {
        sync_question_max_score(&state.db, qid).await?;
    }

    Ok(())
}
