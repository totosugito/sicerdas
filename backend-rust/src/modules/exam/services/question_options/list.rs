use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    QuestionOptionItem, QuestionOptionListBody, QuestionOptionListData,
};
use crate::types::response::PaginationMeta;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct OptionRow {
    id: Uuid,
    question_id: Uuid,
    content: JsonValue,
    is_correct: bool,
    score: i32,
    order: i32,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_question_options(
    state: &AppState,
    body: QuestionOptionListBody,
) -> Result<QuestionOptionListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(qid) = body.question_id {
        values.push(qid.into());
        where_clauses.push(format!("question_id = ${}", values.len()));
    }
    if let Some(is_correct) = body.is_correct {
        values.push(is_correct.into());
        where_clauses.push(format!("is_correct = ${}", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let count_sql = format!("SELECT COUNT(*)::bigint AS total FROM exam_question_options WHERE {where_sql}");
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
        "score" => "score",
        "isCorrect" => "is_correct",
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
        SELECT id, question_id, content, is_correct, score, "order"
        FROM exam_question_options
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = OptionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| QuestionOptionItem {
            id: r.id,
            question_id: r.question_id,
            content: r.content,
            is_correct: r.is_correct,
            score: r.score,
            order: r.order,
        })
        .collect();

    Ok(QuestionOptionListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
