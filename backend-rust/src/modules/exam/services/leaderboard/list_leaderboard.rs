use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::LeaderboardItem;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct LeaderboardRow {
    user_id: Uuid,
    name: Option<String>,
    average_score: String,
    total_exams_taken: i32,
}

pub async fn list_leaderboard(
    state: &AppState,
    limit: u64,
) -> Result<Vec<LeaderboardItem>, AppError> {
    let limit = limit.clamp(1, 100);
    let rows = LeaderboardRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            eusg.user_id,
            u.name,
            eusg.average_score::text AS average_score,
            eusg.total_exams_taken
        FROM exam_user_stats_global eusg
        INNER JOIN users u ON u.id = eusg.user_id
        ORDER BY eusg.average_score DESC
        LIMIT $1
        "#,
        vec![Value::BigInt(Some(limit as i64))],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(rows
        .into_iter()
        .enumerate()
        .map(|(idx, r)| LeaderboardItem {
            rank: idx + 1,
            user_id: r.user_id,
            name: r.name,
            average_score: r.average_score,
            total_exams_taken: r.total_exams_taken,
        })
        .collect())
}
