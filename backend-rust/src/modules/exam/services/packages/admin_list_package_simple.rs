use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{ExamSimpleItem, ExamSimpleListData, PackageSimpleBody};
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

pub async fn admin_list_package_simple(
    state: &AppState,
    is_admin: bool,
    body: PackageSimpleBody,
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

    if let Some(cat_id) = body.category_id {
        params.push(Value::Uuid(Some(Box::new(cat_id))));
        conditions.push(format!("category_id = ${}", params.len()));
    }

    if let Some(ref exam_types) = body.exam_type {
        if !exam_types.is_empty() {
            params.push(Value::Array(
                sea_orm::sea_query::ArrayType::String,
                Some(Box::new(
                    exam_types
                        .iter()
                        .map(|s| Value::String(Some(Box::new(s.clone()))))
                        .collect(),
                )),
            ));
            conditions.push(format!("exam_type::text = ANY(${})", params.len()));
        }
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

    let count_sql = format!("SELECT COUNT(*) AS total FROM exam_packages {where_sql}");
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
        "SELECT id, title FROM exam_packages {where_sql} ORDER BY title ASC LIMIT ${limit_idx} OFFSET ${offset_idx}"
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
