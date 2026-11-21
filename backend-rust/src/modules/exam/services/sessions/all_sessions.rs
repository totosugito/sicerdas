use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    AllSessionHistoryItem, AllSessionHistoryListData, AllSessionsBody,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AllSessionRow {
    id: Uuid,
    start_time: DateTime<Utc>,
    end_time: Option<DateTime<Utc>>,
    status: String,
    mode: String,
    score: Option<f64>,
    total_correct: i32,
    total_wrong: i32,
    total_skipped: i32,
    package_title: String,
    section_title: String,
    package_id: Uuid,
    earned_points: Option<f64>,
    max_points: Option<f64>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn all_sessions(
    state: &AppState,
    user_id: Uuid,
    body: AllSessionsBody,
) -> Result<AllSessionHistoryListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut params = vec![Value::Uuid(Some(Box::new(user_id)))];
    let mut where_sql = "es.user_id = $1".to_string();

    if let Some(ref status) = body.status {
        if !status.trim().is_empty() {
            params.push(Value::String(Some(Box::new(status.clone()))));
            where_sql.push_str(&format!(" AND es.status::text = ${}", params.len()));
        }
    }

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        format!("SELECT COUNT(*) AS total FROM exam_sessions es WHERE {where_sql}"),
        params.clone(),
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total as u64)
    .unwrap_or(0);

    params.push(Value::BigInt(Some(limit as i64)));
    let limit_idx = params.len();
    params.push(Value::BigInt(Some(offset as i64)));
    let offset_idx = params.len();

    let sql = format!(
        r#"
        SELECT
            es.id,
            es.start_time,
            es.end_time,
            es.status::text AS status,
            es.mode::text AS mode,
            es.score::float8 AS score,
            es.total_correct,
            es.total_wrong,
            es.total_skipped,
            ep.title AS package_title,
            eps.title AS section_title,
            es.package_id,
            es.earned_points::float8 AS earned_points,
            es.max_points::float8 AS max_points
        FROM exam_sessions es
        INNER JOIN exam_packages ep ON ep.id = es.package_id
        INNER JOIN exam_package_sections eps ON eps.id = es.section_id
        WHERE {where_sql}
        ORDER BY es.start_time DESC
        LIMIT ${limit_idx} OFFSET ${offset_idx}
        "#
    );

    let rows = AllSessionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| AllSessionHistoryItem {
            id: r.id,
            start_time: r.start_time.to_rfc3339(),
            end_time: r.end_time.map(|t| t.to_rfc3339()),
            status: r.status,
            mode: r.mode,
            score: r.score,
            total_correct: r.total_correct,
            total_wrong: r.total_wrong,
            total_skipped: r.total_skipped,
            package_title: r.package_title,
            section_title: r.section_title,
            package_id: r.package_id,
            earned_points: r.earned_points,
            max_points: r.max_points,
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(AllSessionHistoryListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
