use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{ExamSimpleItem, ExamSimpleListData, SubjectSimpleBody};
use crate::types::response::PaginationMeta;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SimpleRow {
    value: Uuid,
    label: String,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_subjects_simple(
    state: &AppState,
    body: SubjectSimpleBody,
) -> Result<ExamSimpleListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses = vec!["is_active = true".to_string()];

    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{search}%").into());
        where_clauses.push(format!("name ILIKE ${}", values.len()));
    }

    let where_sql = where_clauses.join(" AND ");
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

    values.push((limit as i64).into());
    let limit_ph = values.len();
    values.push((offset as i64).into());
    let offset_ph = values.len();

    let query_sql = format!(
        r#"
        SELECT id AS value, name AS label
        FROM exam_subjects
        WHERE {where_sql}
        ORDER BY name ASC
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = SimpleRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| ExamSimpleItem {
            value: r.value,
            label: r.label,
        })
        .collect();

    Ok(ExamSimpleListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
