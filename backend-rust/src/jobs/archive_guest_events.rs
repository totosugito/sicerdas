use chrono::{Duration, Utc};
use sea_orm::{DatabaseConnection, DbBackend, FromQueryResult, Statement, Value};

#[derive(Debug, FromQueryResult)]
struct CountRow {
    count: i32,
}

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    let cutoff = Utc::now() - Duration::days(30);

    let updated = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH old_guest_events AS (
            SELECT
                reference_id AS book_id,
                COUNT(DISTINCT CASE WHEN action = 'view' THEN session_id END)::int AS view_count,
                COUNT(DISTINCT CASE WHEN action = 'download' THEN session_id END)::int AS download_count
            FROM app_event_history
            WHERE content_type = 'book'
              AND user_id IS NULL
              AND created_at < $1
              AND action IN ('view', 'download')
            GROUP BY reference_id
        ),
        updated_stats AS (
            UPDATE book_event_stats bes
            SET legacy_stats = jsonb_build_object(
                'viewCount', COALESCE((bes.legacy_stats->>'viewCount')::int, 0) + oge.view_count,
                'downloadCount', COALESCE((bes.legacy_stats->>'downloadCount')::int, 0) + oge.download_count
            ),
            updated_at = NOW()
            FROM old_guest_events oge
            WHERE bes.book_id = oge.book_id
            RETURNING bes.book_id
        )
        SELECT COUNT(*)::int AS count FROM updated_stats
        "#,
        vec![Value::ChronoDateTimeUtc(Some(Box::new(cutoff)))],
    ))
    .one(db)
    .await
    .map_err(|e| e.to_string())?
    .map(|r| r.count)
    .unwrap_or(0);

    let mut total_deleted = 0;
    const BATCH_SIZE: i64 = 5000;
    for _ in 0..100 {
        let deleted = CountRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            WITH target_events AS (
                SELECT id
                FROM app_event_history
                WHERE created_at < $1
                  AND content_type = 'book'
                  AND action IN ('view', 'download')
                LIMIT $2
                FOR UPDATE SKIP LOCKED
            ),
            deleted_events AS (
                DELETE FROM app_event_history
                WHERE id IN (SELECT id FROM target_events)
                RETURNING id
            )
            SELECT COUNT(*)::int AS count FROM deleted_events
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

        total_deleted += deleted;
        if (deleted as i64) < BATCH_SIZE {
            break;
        }
    }

    tracing::info!(updated, total_deleted, "[Job] archive-guest-events complete");
    Ok(())
}
