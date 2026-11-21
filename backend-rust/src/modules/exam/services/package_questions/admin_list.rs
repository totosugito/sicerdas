use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    PackageQuestionItem, PackageQuestionListBody, PackageQuestionListData, PackageQuestionRef,
    PackageQuestionSectionRef,
};
use crate::types::response::PaginationMeta;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct PqRow {
    package_id: Uuid,
    section_id: Uuid,
    question_id: Uuid,
    order: i32,
    q_id: Uuid,
    q_content: JsonValue,
    q_type: String,
    q_difficulty: String,
    subject_name: Option<String>,
    sec_id: Option<Uuid>,
    sec_title: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn admin_list(
    state: &AppState,
    body: PackageQuestionListBody,
) -> Result<PackageQuestionListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut params: Vec<Value> = vec![Value::Uuid(Some(Box::new(body.package_id)))];
    let mut where_clause = "epq.package_id = $1".to_string();

    if let Some(sec_id) = body.section_id {
        params.push(Value::Uuid(Some(Box::new(sec_id))));
        where_clause.push_str(&format!(" AND epq.section_id = ${}", params.len()));
    }

    let count_sql = format!(
        r#"
        SELECT COUNT(*) AS total
        FROM exam_package_questions epq
        INNER JOIN exam_questions eq ON eq.id = epq.question_id
        WHERE {where_clause}
        "#
    );
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
        r#"
        SELECT
            epq.package_id,
            epq.section_id,
            epq.question_id,
            epq."order",
            eq.id AS q_id,
            eq.content AS q_content,
            eq.type::text AS q_type,
            eq.difficulty::text AS q_difficulty,
            es.name AS subject_name,
            eps.id AS sec_id,
            eps.title AS sec_title
        FROM exam_package_questions epq
        INNER JOIN exam_questions eq ON eq.id = epq.question_id
        LEFT JOIN exam_subjects es ON es.id = eq.subject_id
        LEFT JOIN exam_package_sections eps ON eps.id = epq.section_id
        WHERE {where_clause}
        ORDER BY epq."order" ASC
        LIMIT ${limit_idx} OFFSET ${offset_idx}
        "#
    );

    let rows = PqRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| PackageQuestionItem {
            package_id: r.package_id,
            section_id: r.section_id,
            question_id: r.question_id,
            order: r.order,
            question: PackageQuestionRef {
                id: r.q_id,
                content: r.q_content,
                r#type: r.q_type,
                difficulty: r.q_difficulty,
                subject_name: r.subject_name,
            },
            section: match (r.sec_id, r.sec_title) {
                (Some(id), Some(title)) => Some(PackageQuestionSectionRef { id, title }),
                _ => None,
            },
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(PackageQuestionListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
