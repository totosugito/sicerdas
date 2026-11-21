use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    ExamTagRef, QuestionListBody, QuestionListData, QuestionListItem,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct QuestionRow {
    id: Uuid,
    subject_id: Uuid,
    passage_id: Option<Uuid>,
    content: JsonValue,
    difficulty: String,
    r#type: String,
    max_score: i32,
    scoring_strategy: String,
    required_tier: Option<String>,
    education_grade_id: Option<i32>,
    is_active: bool,
    variable_formulas: Option<JsonValue>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    subject_name: Option<String>,
    education_grade_name: Option<String>,
    total_options: i64,
}

#[derive(Debug, FromQueryResult)]
struct QuestionTagRow {
    question_id: Uuid,
    tag_id: Uuid,
    tag_name: String,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_questions(
    state: &AppState,
    body: QuestionListBody,
) -> Result<QuestionListData, AppError> {
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
    if let Some(ss) = body.scoring_strategy.as_deref().filter(|s| !s.is_empty()) {
        values.push(ss.to_string().into());
        where_clauses.push(format!(
            "q.scoring_strategy = ${}::scoring_strategy",
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

    let sort_col = match body.sort_by.as_deref().unwrap_or("updatedAt") {
        "createdAt" => "q.created_at",
        "difficulty" => "q.difficulty",
        "type" => "q.type",
        "maxScore" => "q.max_score",
        _ => "q.updated_at",
    };
    let sort_dir = if body.sort_order.as_deref() == Some("asc") {
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
            q.id,
            q.subject_id,
            q.passage_id,
            q.content,
            q.difficulty::text AS difficulty,
            q.type::text AS type,
            q.max_score,
            q.scoring_strategy::text AS scoring_strategy,
            q.required_tier,
            q.education_grade_id,
            q.is_active,
            q.variable_formulas,
            q.created_at,
            q.updated_at,
            s.name AS subject_name,
            eg.name AS education_grade_name,
            COALESCE((SELECT COUNT(*)::bigint FROM exam_question_options o WHERE o.question_id = q.id), 0) AS total_options
        FROM exam_questions q
        LEFT JOIN exam_subjects s ON q.subject_id = s.id
        LEFT JOIN education_grades eg ON q.education_grade_id = eg.id
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = QuestionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let mut tags_by_q: HashMap<Uuid, Vec<ExamTagRef>> = HashMap::new();
    if !rows.is_empty() {
        let mut tag_vals: Vec<Value> = Vec::with_capacity(rows.len());
        let placeholders: Vec<String> = rows
            .iter()
            .map(|r| {
                tag_vals.push(r.id.into());
                format!("${}", tag_vals.len())
            })
            .collect();
        let tag_sql = format!(
            r#"
            SELECT qt.question_id, et.id AS tag_id, et.name AS tag_name
            FROM exam_question_tags qt
            INNER JOIN education_tags et ON qt.tag_id = et.id
            WHERE qt.question_id IN ({})
            "#,
            placeholders.join(", ")
        );
        let tag_rows = QuestionTagRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            &tag_sql,
            tag_vals,
        ))
        .all(&state.db)
        .await?;

        for tr in tag_rows {
            tags_by_q
                .entry(tr.question_id)
                .or_default()
                .push(ExamTagRef {
                    id: tr.tag_id,
                    name: tr.tag_name,
                });
        }
    }

    let items = rows
        .into_iter()
        .map(|r| {
            let tags = tags_by_q.remove(&r.id).unwrap_or_default();
            QuestionListItem {
                id: r.id,
                subject_id: r.subject_id,
                passage_id: r.passage_id,
                content: r.content,
                difficulty: r.difficulty,
                r#type: r.r#type,
                max_score: r.max_score,
                scoring_strategy: r.scoring_strategy,
                required_tier: r.required_tier,
                education_grade_id: r.education_grade_id,
                is_active: r.is_active,
                variable_formulas: r.variable_formulas,
                created_at: r.created_at.to_rfc3339(),
                updated_at: r.updated_at.to_rfc3339(),
                subject_name: r.subject_name,
                education_grade_name: r.education_grade_name,
                total_options: r.total_options,
                tags,
            }
        })
        .collect();

    Ok(QuestionListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
