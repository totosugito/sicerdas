use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::AssignQuestionTagsBody;
use sea_orm::{ConnectionTrait, DbBackend, Statement};

pub async fn assign_question_tags(
    state: &AppState,
    body: AssignQuestionTagsBody,
) -> Result<(), AppError> {
    for tag_id in body.tag_ids {
        state
            .db
            .execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "INSERT INTO exam_question_tags (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                vec![body.question_id.into(), tag_id.into()],
            ))
            .await?;
    }
    Ok(())
}
