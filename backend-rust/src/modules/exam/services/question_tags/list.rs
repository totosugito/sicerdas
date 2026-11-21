use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{ExamTagRef, QuestionTagItem, QuestionTagListBody};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct QuestionTagRow {
    question_id: Uuid,
    tag_id: Uuid,
    tag_name: Option<String>,
}

pub async fn list_question_tags(
    state: &AppState,
    body: QuestionTagListBody,
) -> Result<Vec<QuestionTagItem>, AppError> {
    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses: Vec<String> = Vec::new();

    if let Some(qid) = body.question_id {
        values.push(qid.into());
        where_clauses.push(format!("qt.question_id = ${}", values.len()));
    }
    if let Some(tid) = body.tag_id {
        values.push(tid.into());
        where_clauses.push(format!("qt.tag_id = ${}", values.len()));
    }

    let where_sql = if where_clauses.is_empty() {
        "TRUE".to_string()
    } else {
        where_clauses.join(" AND ")
    };

    let sql = format!(
        r#"
        SELECT qt.question_id, qt.tag_id, et.name AS tag_name
        FROM exam_question_tags qt
        LEFT JOIN education_tags et ON qt.tag_id = et.id
        WHERE {where_sql}
        "#
    );

    let rows = QuestionTagRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &sql,
        values,
    ))
    .all(&state.db)
    .await?;

    Ok(rows
        .into_iter()
        .map(|r| QuestionTagItem {
            question_id: r.question_id,
            tag_id: r.tag_id,
            tag: r.tag_name.map(|name| ExamTagRef {
                id: r.tag_id,
                name,
            }),
        })
        .collect())
}
