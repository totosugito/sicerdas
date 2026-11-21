use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    QuestionListBody, SimpleQuestionItem, SimpleQuestionListData,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SimpleQuestionRow {
    id: Uuid,
    subject_id: Uuid,
    subject_name: Option<String>,
    content: JsonValue,
    difficulty: String,
    r#type: String,
    required_tier: Option<String>,
    education_grade_id: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_questions_simple(
    state: &AppState,
    body: QuestionListBody,
) -> Result<SimpleQuestionListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{search}%").into());
        where_clauses.push(format!("q.content::text ILIKE ${}", values.len()));
    }
    if let Some(sid) = body.subject_id {
        values.push(sid.into());
        where_clauses.push(format!("q.subject_id = ${}", values.len()));
    }
    if let Some(diff) = body.difficulty.as_deref().filter(|s| !s.is_empty()) {
        values.push(diff.to_string().into());
        where_clauses.push(format!("q.difficulty = ${}::difficulty_level", values.len()));
    }
    if let Some(qt) = body.r#type.as_deref().filter(|s| !s.is_empty()) {
        values.push(qt.to_string().into());
        where_clauses.push(format!("q.type = ${}::question_type", values.len()));
    }
    if let Some(tier) = body.required_tier.as_deref().filter(|s| !s.is_empty()) {
        values.push(tier.to_string().into());
        where_clauses.push(format!("q.required_tier = ${}", values.len()));
    }
    if let Some(gid) = body.education_grade_id {
        values.push(gid.into());
        where_clauses.push(format!("q.education_grade_id = ${}", values.len()));
    }
    if let Some(is_active) = body.is_active {
        values.push(is_active.into());
        where_clauses.push(format!("q.is_active = ${}", values.len()));
    }
    if let Some(pkg_id) = body.exclude_package_id {
        values.push(pkg_id.into());
        where_clauses.push(format!(
            "NOT EXISTS (SELECT 1 FROM exam_package_questions epq WHERE epq.question_id = q.id AND epq.package_id = ${})",
            values.len()
        ));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql = format!("SELECT COUNT(*)::bigint AS total FROM exam_questions q WHERE {where_sql}");
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
        SELECT
            q.id,
            q.subject_id,
            s.name AS subject_name,
            q.content,
            q.difficulty::text AS difficulty,
            q.type::text AS type,
            q.required_tier,
            q.education_grade_id,
            q.created_at,
            q.updated_at
        FROM exam_questions q
        LEFT JOIN exam_subjects s ON q.subject_id = s.id
        WHERE {where_sql}
        ORDER BY q.updated_at DESC
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = SimpleQuestionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| SimpleQuestionItem {
            id: r.id,
            subject_id: r.subject_id,
            subject_name: r.subject_name,
            content: r.content,
            difficulty: r.difficulty,
            r#type: r.r#type,
            required_tier: r.required_tier,
            education_grade_id: r.education_grade_id,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    Ok(SimpleQuestionListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
