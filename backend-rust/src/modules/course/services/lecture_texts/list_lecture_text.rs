use crate::app::AppState;
use crate::error::AppError;
use crate::modules::course::types::{
    CourseCategoryRef, CourseGradeRef, LectureTextItem, LectureTextListData, LectureTextListQuery,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct LectureTextRow {
    id: Uuid,
    title: Option<String>,
    content: JsonValue,
    category_id: Option<Uuid>,
    education_grade_id: Option<i32>,
    status: String,
    created_by_user_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    cat_id: Option<Uuid>,
    cat_name: Option<String>,
    cat_key: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    grade_val: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_lecture_texts(
    state: &AppState,
    query: LectureTextListQuery,
) -> Result<LectureTextListData, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
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

    let sort_col = match query.sort_by.as_deref().unwrap_or("createdAt") {
        "title" => "lt.title",
        "status" => "lt.status",
        "updatedAt" => "lt.updated_at",
        _ => "lt.created_at",
    };
    let sort_dir = if query.sort_order.as_deref() == Some("asc") {
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
            lt.id,
            lt.title,
            lt.content,
            lt.category_id,
            lt.education_grade_id,
            lt.status::text AS status,
            lt.created_by_user_id,
            lt.created_at,
            lt.updated_at,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val
        FROM course_lecture_texts lt
        LEFT JOIN education_categories ec ON lt.category_id = ec.id
        LEFT JOIN education_grades eg ON lt.education_grade_id = eg.id
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = LectureTextRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| LectureTextItem {
            id: r.id,
            title: r.title,
            content: r.content,
            category_id: r.category_id,
            education_grade_id: r.education_grade_id,
            status: r.status,
            created_by_user_id: r.created_by_user_id,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
            category: r.cat_id.map(|cid| CourseCategoryRef {
                id: cid,
                name: r.cat_name.unwrap_or_default(),
                key: r.cat_key.unwrap_or_default(),
            }),
            grade: r.grade_id.map(|gid| CourseGradeRef {
                id: gid,
                name: r.grade_name.unwrap_or_default(),
                grade: r.grade_val.unwrap_or_default(),
            }),
        })
        .collect();

    Ok(LectureTextListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
