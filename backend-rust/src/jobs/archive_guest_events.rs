use chrono::{Duration, Utc};
use sea_orm::{DatabaseConnection, DbBackend, FromQueryResult, Statement, TransactionTrait, Value};

#[derive(Debug, FromQueryResult)]
struct BatchRow {
    deleted_count: i32,
    updated_books: i32,
}

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    let cutoff = Utc::now() - Duration::days(30);
    const BATCH_SIZE: i64 = 5000;

    let mut total_deleted = 0;
    let mut total_updated = 0;

    for _ in 0..100 {
        let txn = db.begin().await.map_err(|e| e.to_string())?;
        let batch = BatchRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            WITH target_events AS (
                SELECT id
                FROM app_event_history
                WHERE content_type = 'book'
                  AND user_id IS NULL
                  AND created_at < $1
                  AND action IN ('view', 'download')
                LIMIT $2
                FOR UPDATE SKIP LOCKED
            ),
            deleted_events AS (
                DELETE FROM app_event_history
                WHERE id IN (SELECT id FROM target_events)
                RETURNING reference_id, action, session_id
            ),
            batch_agg AS (
                SELECT
                    reference_id AS book_id,
                    COUNT(DISTINCT CASE WHEN action = 'view' THEN session_id END)::int AS view_count,
                    COUNT(DISTINCT CASE WHEN action = 'download' THEN session_id END)::int AS download_count
                FROM deleted_events
                GROUP BY reference_id
            ),
            updated_stats AS (
                UPDATE book_event_stats bes
                SET legacy_stats = jsonb_build_object(
                    'viewCount', COALESCE((bes.legacy_stats->>'viewCount')::int, 0) + ba.view_count,
                    'downloadCount', COALESCE((bes.legacy_stats->>'downloadCount')::int, 0) + ba.download_count
                ),
                updated_at = NOW()
                FROM batch_agg ba
                WHERE bes.book_id = ba.book_id
                RETURNING bes.book_id
            )
            SELECT
                (SELECT COUNT(*)::int FROM deleted_events) AS deleted_count,
                (SELECT COUNT(*)::int FROM updated_stats) AS updated_books
            "#,
            vec![
                Value::ChronoDateTimeUtc(Some(Box::new(cutoff))),
                Value::BigInt(Some(BATCH_SIZE)),
            ],
        ))
        .one(&txn)
        .await
        .map_err(|e| e.to_string())?
        .unwrap_or(BatchRow {
            deleted_count: 0,
            updated_books: 0,
        });

        txn.commit().await.map_err(|e| e.to_string())?;

        total_deleted += batch.deleted_count;
        total_updated += batch.updated_books;
        if (batch.deleted_count as i64) < BATCH_SIZE {
            break;
        }
    }

    tracing::info!(total_updated, total_deleted, "[Job] archive-guest-events complete");
    Ok(())
}
