use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{SubjectStatsBody, SubjectStatsItem, SubjectStatsListData};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SubjectStatRow {
    id: Uuid,
    subject_id: Uuid,
    subject_name: String,
    total_questions_answered: i32,
    total_correct: i32,
    total_wrong: i32,
    accuracy_rate: String,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn subject_stats(
    state: &AppState,
    user_id: Uuid,
    body: SubjectStatsBody,
) -> Result<SubjectStatsListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT COUNT(*) AS total FROM exam_user_stats_subject WHERE user_id = $1",
        vec![Value::Uuid(Some(Box::new(user_id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total as u64)
    .unwrap_or(0);

    let sort_col = match body.sort_by.as_deref() {
        Some("totalQuestionsAnswered") => "s.total_questions_answered",
        Some("totalCorrect") => "s.total_correct",
        Some("subjectName") => "es.name",
        _ => "s.accuracy_rate",
    };
    let sort_dir = match body.order.as_deref() {
        Some("asc") => "ASC",
        _ => "DESC",
    };

    let sql = format!(
        r#"
        SELECT
            s.id,
            s.subject_id,
            es.name AS subject_name,
            s.total_questions_answered,
            s.total_correct,
            s.total_wrong,
            s.accuracy_rate::text AS accuracy_rate,
            s.updated_at
        FROM exam_user_stats_subject s
        INNER JOIN exam_subjects es ON es.id = s.subject_id
        WHERE s.user_id = $1
        ORDER BY {sort_col} {sort_dir}
        LIMIT $2 OFFSET $3
        "#
    );

    let rows = SubjectStatRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::BigInt(Some(limit as i64)),
            Value::BigInt(Some(offset as i64)),
        ],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| SubjectStatsItem {
            id: r.id,
            subject_id: r.subject_id,
            subject_name: r.subject_name,
            total_questions_answered: r.total_questions_answered,
            total_correct: r.total_correct,
            total_wrong: r.total_wrong,
            accuracy_rate: r.accuracy_rate,
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(SubjectStatsListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
