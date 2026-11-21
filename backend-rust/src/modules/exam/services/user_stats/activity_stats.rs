use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::ActivityItem;
use chrono::{Duration, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct ActivityRow {
    date: String,
    total_correct: i32,
    total_wrong: i32,
    total_skipped: i32,
    total_sessions: i32,
}

pub async fn activity_stats(
    state: &AppState,
    user_id: Uuid,
    days: i32,
) -> Result<Vec<ActivityItem>, AppError> {
    let start_date = Utc::now() - Duration::days(days.max(1) as i64);

    let rows = ActivityRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            TO_CHAR(start_time, 'YYYY-MM-DD') AS date,
            COALESCE(SUM(total_correct), 0)::int AS total_correct,
            COALESCE(SUM(total_wrong), 0)::int AS total_wrong,
            COALESCE(SUM(total_skipped), 0)::int AS total_skipped,
            COUNT(id)::int AS total_sessions
        FROM exam_sessions
        WHERE user_id = $1 AND start_time >= $2
        GROUP BY TO_CHAR(start_time, 'YYYY-MM-DD')
        ORDER BY TO_CHAR(start_time, 'YYYY-MM-DD') ASC
        "#,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::ChronoDateTimeUtc(Some(Box::new(start_date))),
        ],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(rows
        .into_iter()
        .map(|r| ActivityItem {
            date: r.date,
            total_questions: r.total_correct + r.total_wrong + r.total_skipped,
            total_correct: r.total_correct,
            total_wrong: r.total_wrong,
            total_sessions: r.total_sessions,
        })
        .collect())
}
