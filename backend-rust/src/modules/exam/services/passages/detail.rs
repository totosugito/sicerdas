use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::PassageItem;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct PassageRow {
    id: Uuid,
    title: Option<String>,
    content: JsonValue,
    is_active: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    subject_id: Uuid,
    total_questions: i32,
    active_questions: i32,
    subject_name: Option<String>,
}

pub async fn detail_passage(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<PassageItem, AppError> {
    let r = PassageRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            p.id,
            p.title,
            p.content,
            p.is_active,
            p.created_at,
            p.updated_at,
            p.subject_id,
            p.total_questions,
            p.active_questions,
            s.name AS subject_name
        FROM exam_passages p
        LEFT JOIN exam_subjects s ON p.subject_id = s.id
        WHERE p.id = $1
        LIMIT 1
        "#,
        vec![id.into()],
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| {
        AppError::NotFound(locales::translate(
            lang,
            LocaleKey::ExamPassagesUpdateNotFound,
        ))
    })?;

    Ok(PassageItem {
        id: r.id,
        title: r.title,
        content: r.content,
        is_active: r.is_active,
        created_at: r.created_at.to_rfc3339(),
        updated_at: r.updated_at.to_rfc3339(),
        subject_id: r.subject_id,
        total_questions: r.total_questions,
        active_questions: r.active_questions,
        subject_name: r.subject_name.unwrap_or_default(),
    })
}
