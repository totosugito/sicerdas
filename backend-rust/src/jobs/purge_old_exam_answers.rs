use chrono::{Duration, Utc};
use sea_orm::{DatabaseConnection, DbBackend, FromQueryResult, Statement, Value};

#[derive(Debug, FromQueryResult)]
struct CountRow {
    count: i32,
}

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    let retention_days: i64 = std::env::var("EXAM_ANSWERS_RETENTION_DAYS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(365);
    let cutoff = Utc::now() - Duration::days(retention_days);

    let mut total_purged = 0;
    const BATCH_SIZE: i64 = 1000;

    for _ in 0..50 {
        let purged = CountRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            WITH target_sessions AS (
                SELECT id
                FROM exam_sessions
                WHERE created_at < $1
                  AND is_answers_purged = false
                LIMIT $2
                FOR UPDATE SKIP LOCKED
            ),
            deleted_answers AS (
                DELETE FROM exam_session_answers
                WHERE session_id IN (SELECT id FROM target_sessions)
            ),
            updated_sessions AS (
                UPDATE exam_sessions
                SET is_answers_purged = true, updated_at = NOW()
                WHERE id IN (SELECT id FROM target_sessions)
                RETURNING id
            )
            SELECT COUNT(*)::int AS count FROM updated_sessions
            "#,
            vec![
                Value::ChronoDateTimeUtc(Some(Box::new(cutoff))),
                Value::BigInt(Some(BATCH_SIZE)),
            ],
        ))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .map(|r| r.count)
        .unwrap_or(0);

        total_purged += purged;
        if (purged as i64) < BATCH_SIZE {
            break;
        }
    }

    tracing::info!(total_purged, "[Job] purge-old-exam-answers complete");
    Ok(())
}
