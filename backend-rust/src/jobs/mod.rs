pub mod archive_guest_events;
pub mod clean_stale_sessions;
pub mod compute_course_stats;
pub mod compute_exam_stats;
pub mod purge_old_exam_answers;
pub mod reconcile_exam_stats;
pub mod update_book_stats;
pub mod update_user_stats;

use sea_orm::{
    ConnectionTrait, DatabaseConnection, DbBackend, FromQueryResult, Statement, Value,
};
use std::time::Instant;

#[derive(Debug, FromQueryResult)]
struct JobLogIdRow {
    id: i32,
}

fn job_lock_key(name: &str) -> i64 {
    let mut hash: u64 = 0xcbf29ce484222325;
    for b in name.as_bytes() {
        hash ^= *b as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    (hash & 0x7fff_ffff_ffff_ffff) as i64
}

pub async fn run_job(db: &DatabaseConnection, name: &str) -> Result<(), String> {
    match name {
        "daily-all" => {
            let jobs = [
                "archive-guest-events",
                "clean-stale-sessions",
                "compute-course-stats",
                "compute-exam-stats",
                "purge-old-exam-answers",
                "reconcile-exam-stats",
                "update-book-stats",
                "update-user-stats",
            ];
            for j in jobs {
                run_one_logged(db, j).await?;
            }
            Ok(())
        }
        "archive-guest-events"
        | "clean-stale-sessions"
        | "compute-course-stats"
        | "compute-exam-stats"
        | "purge-old-exam-answers"
        | "reconcile-exam-stats"
        | "update-book-stats"
        | "update-user-stats" => run_one_logged(db, name).await,
        other => Err(format!("Unknown job: {other}")),
    }
}

async fn run_one_logged(db: &DatabaseConnection, name: &str) -> Result<(), String> {
    let lock_id = job_lock_key(name);
    let pool = db.get_postgres_connection_pool();
    let mut lock_conn = pool.acquire().await.map_err(|e| e.to_string())?;
    let acquired: bool = sea_orm::sqlx::query_scalar("SELECT pg_try_advisory_lock($1)")
        .bind(lock_id)
        .fetch_one(&mut *lock_conn)
        .await
        .map_err(|e| e.to_string())?;

    if !acquired {
        tracing::warn!(job = name, "Skipping job because another instance holds the advisory lock");
        return Ok(());
    }

    tracing::info!(job = name, "Running daily scheduled job");
    let started = Instant::now();

    let log_id = JobLogIdRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        INSERT INTO job_logs (job_name, "group", status, triggered_by, start_time, created_at)
        VALUES ($1, 'daily'::job_group, 'running'::job_status, 'system'::job_trigger, NOW(), NOW())
        RETURNING id
        "#,
        vec![Value::String(Some(Box::new(name.to_string())))],
    ))
    .one(db)
    .await
    .ok()
    .flatten()
    .map(|r| r.id);

    let res = match name {
        "archive-guest-events" => archive_guest_events::run(db).await,
        "clean-stale-sessions" => clean_stale_sessions::run(db).await,
        "compute-course-stats" => compute_course_stats::run(db).await,
        "compute-exam-stats" => compute_exam_stats::run(db).await,
        "purge-old-exam-answers" => purge_old_exam_answers::run(db).await,
        "reconcile-exam-stats" => reconcile_exam_stats::run(db).await,
        "update-book-stats" => update_book_stats::run(db).await,
        "update-user-stats" => update_user_stats::run(db).await,
        _ => unreachable!(),
    };

    let duration_ms = started.elapsed().as_millis() as i32;
    if let Some(id) = log_id {
        match &res {
            Ok(()) => {
                let _ = db
                    .execute(Statement::from_sql_and_values(
                        DbBackend::Postgres,
                        r#"
                        UPDATE job_logs
                        SET status = 'success'::job_status,
                            end_time = NOW(),
                            duration_ms = $1,
                            result = '{"success":true}'::jsonb
                        WHERE id = $2
                        "#,
                        vec![Value::Int(Some(duration_ms)), Value::Int(Some(id))],
                    ))
                    .await;
            }
            Err(err_msg) => {
                let _ = db
                    .execute(Statement::from_sql_and_values(
                        DbBackend::Postgres,
                        r#"
                        UPDATE job_logs
                        SET status = 'failed'::job_status,
                            end_time = NOW(),
                            duration_ms = $1,
                            error = $2
                        WHERE id = $3
                        "#,
                        vec![
                            Value::Int(Some(duration_ms)),
                            Value::String(Some(Box::new(err_msg.clone()))),
                            Value::Int(Some(id)),
                        ],
                    ))
                    .await;
            }
        }
    }

    let _: Option<bool> = sea_orm::sqlx::query_scalar("SELECT pg_advisory_unlock($1)")
        .bind(lock_id)
        .fetch_optional(&mut *lock_conn)
        .await
        .ok()
        .flatten();

    res
}
