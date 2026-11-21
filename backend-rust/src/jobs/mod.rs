pub mod archive_guest_events;
pub mod clean_stale_sessions;
pub mod compute_course_stats;
pub mod compute_exam_stats;
pub mod purge_old_exam_answers;
pub mod reconcile_exam_stats;
pub mod update_book_stats;
pub mod update_user_stats;

use sea_orm::DatabaseConnection;

pub async fn run_job(db: &DatabaseConnection, name: &str) -> Result<(), String> {
    match name {
        "archive-guest-events" => archive_guest_events::run(db).await,
        "clean-stale-sessions" => clean_stale_sessions::run(db).await,
        "compute-course-stats" => compute_course_stats::run(db).await,
        "compute-exam-stats" => compute_exam_stats::run(db).await,
        "purge-old-exam-answers" => purge_old_exam_answers::run(db).await,
        "reconcile-exam-stats" => reconcile_exam_stats::run(db).await,
        "update-book-stats" => update_book_stats::run(db).await,
        "update-user-stats" => update_user_stats::run(db).await,
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
                run_one_named(db, j).await?;
            }
            Ok(())
        }
        other => Err(format!("Unknown job: {other}")),
    }
}

async fn run_one_named(db: &DatabaseConnection, name: &str) -> Result<(), String> {
    tracing::info!(job = name, "Running daily scheduled job");
    match name {
        "archive-guest-events" => archive_guest_events::run(db).await,
        "clean-stale-sessions" => clean_stale_sessions::run(db).await,
        "compute-course-stats" => compute_course_stats::run(db).await,
        "compute-exam-stats" => compute_exam_stats::run(db).await,
        "purge-old-exam-answers" => purge_old_exam_answers::run(db).await,
        "reconcile-exam-stats" => reconcile_exam_stats::run(db).await,
        "update-book-stats" => update_book_stats::run(db).await,
        "update-user-stats" => update_user_stats::run(db).await,
        _ => unreachable!(),
    }
}
