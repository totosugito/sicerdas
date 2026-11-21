use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    QuestionSolutionItem, QuestionSolutionListBody, QuestionSolutionListData,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SolutionRow {
    id: Uuid,
    question_id: Uuid,
    title: String,
    content: JsonValue,
    solution_type: String,
    order: i32,
    required_tier: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_question_solutions(
    state: &AppState,
    body: QuestionSolutionListBody,
) -> Result<QuestionSolutionListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(qid) = body.question_id {
        values.push(qid.into());
        where_clauses.push(format!("question_id = ${}", values.len()));
    }
    if let Some(st) = body.solution_type.as_deref().filter(|s| !s.is_empty()) {
        values.push(st.to_string().into());
        where_clauses.push(format!("solution_type = ${}::solution_type", values.len()));
    }
    if let Some(tier) = body.required_tier.as_deref().filter(|s| !s.is_empty()) {
        values.push(tier.to_string().into());
        where_clauses.push(format!("required_tier = ${}", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql =
        format!("SELECT COUNT(*)::bigint AS total FROM exam_question_solutions WHERE {where_sql}");
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

    let sort_col = match body.sort_by.as_deref().unwrap_or("order") {
        "title" => "title",
        "createdAt" => "created_at",
        "updatedAt" => "updated_at",
        _ => "\"order\"",
    };
    let sort_dir = if body.sort_order.as_deref() == Some("desc") {
        "DESC"
    } else {
        "ASC"
    };

    values.push((limit as i64).into());
    let limit_ph = values.len();
    values.push((offset as i64).into());
    let offset_ph = values.len();

    let query_sql = format!(
        r#"
        SELECT id, question_id, title, content, solution_type::text AS solution_type, "order", required_tier, created_at, updated_at
        FROM exam_question_solutions
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = SolutionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| QuestionSolutionItem {
            id: r.id,
            question_id: r.question_id,
            title: r.title,
            content: r.content,
            solution_type: r.solution_type,
            order: r.order,
            required_tier: r.required_tier,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    Ok(QuestionSolutionListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
