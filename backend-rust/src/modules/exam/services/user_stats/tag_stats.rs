use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{TagStatsItem, TagStatsListData, TagStatsQuery};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct TagStatRow {
    id: Uuid,
    tag_id: Uuid,
    tag_name: String,
    total_questions_answered: i32,
    total_correct: i32,
    total_wrong: i32,
    accuracy_rate: String,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn tag_stats(
    state: &AppState,
    user_id: Uuid,
    query: TagStatsQuery,
) -> Result<TagStatsListData, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(5).clamp(1, 100);
    let offset = (page - 1) * limit;

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT COUNT(*) AS total FROM exam_user_stats_tag WHERE user_id = $1",
        vec![Value::Uuid(Some(Box::new(user_id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total as u64)
    .unwrap_or(0);

    let sort_col = match query.sort_by.as_deref() {
        Some("totalQuestionsAnswered") => "t.total_questions_answered",
        Some("totalCorrect") => "t.total_correct",
        Some("tagName") => "et.name",
        _ => "t.accuracy_rate",
    };
    let sort_dir = match query.order.as_deref() {
        Some("asc") => "ASC",
        _ => "DESC",
    };

    let sql = format!(
        r#"
        SELECT
            t.id,
            t.tag_id,
            et.name AS tag_name,
            t.total_questions_answered,
            t.total_correct,
            t.total_wrong,
            t.accuracy_rate::text AS accuracy_rate,
            t.updated_at
        FROM exam_user_stats_tag t
        INNER JOIN education_tags et ON et.id = t.tag_id
        WHERE t.user_id = $1
        ORDER BY {sort_col} {sort_dir}
        LIMIT $2 OFFSET $3
        "#
    );

    let rows = TagStatRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::BigInt(Some(limit as i64)),
            Value::BigInt(Some(offset as i64)),
        ],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| TagStatsItem {
            id: r.id,
            tag_id: r.tag_id,
            tag_name: r.tag_name,
            total_questions_answered: r.total_questions_answered,
            total_correct: r.total_correct,
            total_wrong: r.total_wrong,
            accuracy_rate: r.accuracy_rate,
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(TagStatsListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
