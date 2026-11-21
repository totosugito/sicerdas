use crate::app::AppState;
use crate::error::AppError;
use crate::modules::course::types::{
    LectureTextSimpleListData, LectureTextSimpleQuery, SimpleLectureTextItem,
};
use crate::types::response::PaginationMeta;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SimpleRow {
    value: Uuid,
    label: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_simple_lecture_texts(
    state: &AppState,
    query: LectureTextSimpleQuery,
) -> Result<LectureTextSimpleListData, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(search) = query.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{search}%").into());
        let p = values.len();
        where_clauses.push(format!("(lt.title ILIKE ${p} OR ec.name ILIKE ${p})"));
    }
    if let Some(cid) = query.category_id {
        values.push(cid.into());
        where_clauses.push(format!("lt.category_id = ${}", values.len()));
    }
    if let Some(gid) = query.education_grade_id {
        values.push(gid.into());
        where_clauses.push(format!("lt.education_grade_id = ${}", values.len()));
    }
    if let Some(status) = query.status.as_deref().filter(|s| !s.is_empty()) {
        values.push(status.to_string().into());
        where_clauses.push(format!("lt.status = ${}::status", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql = format!(
        r#"
        SELECT COUNT(*)::bigint AS total
        FROM course_lecture_texts lt
        LEFT JOIN education_categories ec ON lt.category_id = ec.id
        WHERE {where_sql}
        "#
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

    values.push((limit as i64).into());
    let limit_ph = values.len();
    values.push((offset as i64).into());
    let offset_ph = values.len();

    let query_sql = format!(
        r#"
        SELECT lt.id AS value, lt.title AS label
        FROM course_lecture_texts lt
        LEFT JOIN education_categories ec ON lt.category_id = ec.id
        WHERE {where_sql}
        ORDER BY lt.title ASC
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
        .map(|r| SimpleLectureTextItem {
            value: r.value,
            label: r
                .label
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "Artikel Tanpa Nama".to_string()),
        })
        .collect();

    Ok(LectureTextSimpleListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
