use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{PassageItem, PassageListBody, PassageListData};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct PassageRow {
    id: Uuid,
    title: Option<String>,
    content: JsonValue,
    is_active: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    subject_id: Uuid,
    total_questions: i32,
    active_questions: i32,
    subject_name: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_passages(
    state: &AppState,
    body: PassageListBody,
) -> Result<PassageListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{search}%").into());
        where_clauses.push(format!("p.title ILIKE ${}", values.len()));
    }
    if let Some(is_active) = body.is_active {
        values.push(is_active.into());
        where_clauses.push(format!("p.is_active = ${}", values.len()));
    }
    if let Some(subject_id) = body.subject_id {
        values.push(subject_id.into());
        where_clauses.push(format!("p.subject_id = ${}", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql = format!(
        "SELECT COUNT(*)::bigint AS total FROM exam_passages p WHERE {where_sql}"
    );
    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &count_sql,
        values.clone(),
    ))
    .one(&state.db)
    .await?
    .map(|r| r.total.max(0) as u64)
    .unwrap_or(0);

    let total_pages = if total == 0 { 0 } else { total.div_ceil(limit) };

    let sort_col = match body.sort_by.as_deref().unwrap_or("updatedAt") {
        "title" => "p.title",
        "createdAt" => "p.created_at",
        "totalQuestions" => "p.total_questions",
        _ => "p.updated_at",
    };
    let sort_dir = if body.sort_order.as_deref() == Some("asc") {
        "ASC"
    } else {
        "DESC"
    };

    values.push((limit as i64).into());
    let limit_ph = values.len();
    values.push((offset as i64).into());
    let offset_ph = values.len();

    let query_sql = format!(
        r#"
        SELECT
            p.id,
            p.title,
            p.content,
            p.is_active,
            p.created_at,
            p.updated_at,
            p.subject_id,
            p.total_questions,
            p.active_questions,
            s.name AS subject_name
        FROM exam_passages p
        LEFT JOIN exam_subjects s ON p.subject_id = s.id
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = PassageRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| PassageItem {
            id: r.id,
            title: r.title,
            content: r.content,
            is_active: r.is_active,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
            subject_id: r.subject_id,
            total_questions: r.total_questions,
            active_questions: r.active_questions,
            subject_name: r.subject_name.unwrap_or_default(),
        })
        .collect();

    Ok(PassageListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
