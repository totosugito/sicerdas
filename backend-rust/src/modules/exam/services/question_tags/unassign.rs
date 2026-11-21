use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::AssignQuestionTagsBody;
use sea_orm::{ConnectionTrait, DbBackend, Statement};

pub async fn unassign_question_tags(
    state: &AppState,
    body: AssignQuestionTagsBody,
) -> Result<(), AppError> {
    for tag_id in body.tag_ids {
        state
            .db
            .execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "DELETE FROM exam_question_tags WHERE question_id = $1 AND tag_id = $2",
                vec![body.question_id.into(), tag_id.into()],
            ))
            .await?;
    }
    Ok(())
}
