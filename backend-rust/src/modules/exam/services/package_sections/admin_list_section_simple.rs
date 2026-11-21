use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{ExamSimpleItem, ExamSimpleListData, SectionSimpleBody};
use crate::types::response::PaginationMeta;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SimpleRow {
    id: Uuid,
    title: String,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn admin_list_section_simple(
    state: &AppState,
    is_admin: bool,
    body: SectionSimpleBody,
) -> Result<ExamSimpleListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut conditions = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if !is_admin {
        conditions.push("is_active = true".to_string());
    } else if let Some(is_active) = body.is_active {
        params.push(Value::Bool(Some(is_active)));
        conditions.push(format!("is_active = ${}", params.len()));
    }

    if let Some(pkg_id) = body.package_id {
        params.push(Value::Uuid(Some(Box::new(pkg_id))));
        conditions.push(format!("package_id = ${}", params.len()));
    }

    if let Some(ref search) = body.search {
        let trimmed = search.trim();
        if !trimmed.is_empty() {
            params.push(Value::String(Some(Box::new(format!("%{trimmed}%")))));
            conditions.push(format!("title ILIKE ${}", params.len()));
        }
    }

    let where_sql = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_sql = format!("SELECT COUNT(*) AS total FROM exam_package_sections {where_sql}");
    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        count_sql,
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
        "SELECT id, title FROM exam_package_sections {where_sql} ORDER BY \"order\" ASC, title ASC LIMIT ${limit_idx} OFFSET ${offset_idx}"
    );
    let rows = SimpleRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| ExamSimpleItem {
            value: r.id,
            label: r.title,
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

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
