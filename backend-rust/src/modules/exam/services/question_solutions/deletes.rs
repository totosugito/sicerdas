use crate::app::AppState;
use crate::db::entities::exam::exam_question_solutions;
use crate::error::AppError;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use uuid::Uuid;

pub async fn delete_multiple_question_solutions(
    state: &AppState,
    ids: Vec<Uuid>,
) -> Result<(), AppError> {
    if ids.is_empty() {
        return Ok(());
    }

    exam_question_solutions::Entity::delete_many()
        .filter(exam_question_solutions::Column::Id.is_in(ids))
        .exec(&state.db)
        .await?;

    Ok(())
}
