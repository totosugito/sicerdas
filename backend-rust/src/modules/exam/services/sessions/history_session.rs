use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    SessionHistoryBody, SessionHistoryItem, SessionHistoryListData,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct HistoryRow {
    id: Uuid,
    start_time: DateTime<Utc>,
    end_time: Option<DateTime<Utc>>,
    status: String,
    mode: String,
    score: Option<f64>,
    total_correct: i32,
    total_wrong: i32,
    total_skipped: i32,
    earned_points: Option<f64>,
    max_points: Option<f64>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn history_session(
    state: &AppState,
    user_id: Uuid,
    body: SessionHistoryBody,
) -> Result<SessionHistoryListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(5).clamp(1, 50);
    let offset = (page - 1) * limit;

    let base_params = vec![
        Value::Uuid(Some(Box::new(user_id))),
        Value::Uuid(Some(Box::new(body.package_id))),
        Value::Uuid(Some(Box::new(body.section_id))),
    ];

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*) AS total
        FROM exam_sessions
        WHERE user_id = $1 AND package_id = $2 AND section_id = $3
        "#,
        base_params.clone(),
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total as u64)
    .unwrap_or(0);

    let mut list_params = base_params;
    list_params.push(Value::BigInt(Some(limit as i64)));
    list_params.push(Value::BigInt(Some(offset as i64)));

    let rows = HistoryRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            id,
            start_time,
            end_time,
            status::text AS status,
            mode::text AS mode,
            score::float8 AS score,
            total_correct,
            total_wrong,
            total_skipped,
            earned_points::float8 AS earned_points,
            max_points::float8 AS max_points
        FROM exam_sessions
        WHERE user_id = $1 AND package_id = $2 AND section_id = $3
        ORDER BY start_time DESC
        LIMIT $4 OFFSET $5
        "#,
        list_params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| SessionHistoryItem {
            id: r.id,
            start_time: r.start_time.to_rfc3339(),
            end_time: r.end_time.map(|t| t.to_rfc3339()),
            status: r.status,
            mode: r.mode,
            score: r.score,
            total_correct: r.total_correct,
            total_wrong: r.total_wrong,
            total_skipped: r.total_skipped,
            earned_points: r.earned_points,
            max_points: r.max_points,
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(SessionHistoryListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
