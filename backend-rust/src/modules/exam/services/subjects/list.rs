use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{SubjectItem, SubjectListBody, SubjectListData};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SubjectRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    is_active: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_subjects(
    state: &AppState,
    body: SubjectListBody,
) -> Result<SubjectListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{search}%").into());
        let p = values.len();
        where_clauses.push(format!("(name ILIKE ${p} OR description ILIKE ${p})"));
    }
    if let Some(is_active) = body.is_active {
        values.push(is_active.into());
        where_clauses.push(format!("is_active = ${}", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql = format!("SELECT COUNT(*)::bigint AS total FROM exam_subjects WHERE {where_sql}");
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
        "name" => "name",
        "createdAt" => "created_at",
        _ => "updated_at",
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
        SELECT id, name, description, is_active, created_at, updated_at
        FROM exam_subjects
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = SubjectRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| SubjectItem {
            id: r.id,
            name: r.name,
            description: r.description,
            is_active: r.is_active,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    Ok(SubjectListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
