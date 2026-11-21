use chrono::{Duration, Utc};
use sea_orm::{DatabaseConnection, DbBackend, FromQueryResult, Statement, Value};

#[derive(Debug, FromQueryResult)]
struct CountRow {
    count: i32,
}

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    let stale_days: i64 = std::env::var("EXAM_STALE_SESSION_DAYS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(30);
    let cutoff = Utc::now() - Duration::days(stale_days);

    let mut total_cleaned = 0;
    const BATCH_SIZE: i64 = 1000;

    for _ in 0..50 {
        let cleaned = CountRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            WITH target_sessions AS (
                SELECT id
                FROM exam_sessions
                WHERE status = 'in_progress'
                  AND updated_at < $1
                LIMIT $2
                FOR UPDATE SKIP LOCKED
            ),
            updated_sessions AS (
                UPDATE exam_sessions
                SET status = 'abandoned', updated_at = NOW()
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

        total_cleaned += cleaned;
        if (cleaned as i64) < BATCH_SIZE {
            break;
        }
    }

    tracing::info!(total_cleaned, "[Job] clean-stale-sessions complete");
    Ok(())
}
