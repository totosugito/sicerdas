use crate::app::AppState;
use crate::db::entities::education::education_tags;
use crate::error::AppError;
use crate::modules::exam::types::AssignQuestionTagsByNameBody;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ConnectionTrait, DbBackend, FromQueryResult, Set, Statement,
};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct TagIdRow {
    id: Uuid,
}

pub async fn assign_question_tags_by_names(
    state: &AppState,
    body: AssignQuestionTagsByNameBody,
) -> Result<(), AppError> {
    let now = Utc::now();
    for raw_name in body.tags {
        let trimmed = raw_name.trim();
        if trimmed.is_empty() {
            continue;
        }

        let existing = TagIdRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT id FROM education_tags WHERE lower(name) = $1 LIMIT 1",
            vec![trimmed.to_lowercase().into()],
        ))
        .one(&state.db)
        .await?;

        let tag_id = if let Some(row) = existing {
            row.id
        } else {
            let active = education_tags::ActiveModel {
                id: Set(Uuid::new_v4()),
                name: Set(trimmed.to_string()),
                description: Set(None),
                created_by_user_id: Set(None),
                is_active: Set(true),
                created_at: Set(now.into()),
                updated_at: Set(now.into()),
            };
            active.insert(&state.db).await?.id
        };

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
