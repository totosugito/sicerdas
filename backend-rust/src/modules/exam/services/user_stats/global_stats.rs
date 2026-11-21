use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::GlobalStatsItem;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct GlobalStatsRow {
    user_id: Uuid,
    total_exams_taken: i32,
    total_questions_answered: i32,
    total_correct_answers: i32,
    total_wrong_answers: i32,
    average_score: String,
    accuracy_rate: String,
    last_active_at: Option<DateTime<Utc>>,
    updated_at: DateTime<Utc>,
}

pub async fn global_stats(
    state: &AppState,
    user_id: Uuid,
) -> Result<Option<GlobalStatsItem>, AppError> {
    let row = GlobalStatsRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            user_id,
            total_exams_taken,
            total_questions_answered,
            total_correct_answers,
            total_wrong_answers,
            average_score::text AS average_score,
            CASE
                WHEN total_questions_answered > 0
                THEN ROUND((total_correct_answers::numeric / total_questions_answered) * 100, 2)::text
                ELSE '0'
            END AS accuracy_rate,
            last_active_at,
            updated_at
        FROM exam_user_stats_global
        WHERE user_id = $1
        LIMIT 1
        "#,
        vec![Value::Uuid(Some(Box::new(user_id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(row.map(|r| GlobalStatsItem {
        user_id: r.user_id,
        total_exams_taken: r.total_exams_taken,
        total_questions_answered: r.total_questions_answered,
        total_correct_answers: r.total_correct_answers,
        total_wrong_answers: r.total_wrong_answers,
        average_score: r.average_score,
        accuracy_rate: r.accuracy_rate,
        last_active_at: r.last_active_at.map(|t| t.to_rfc3339()),
        updated_at: r.updated_at.to_rfc3339(),
    }))
}
