use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::AdminSectionItem;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AdminSectionDetailRow {
    id: Uuid,
    package_id: Uuid,
    title: String,
    group_name: Option<String>,
    description: Option<String>,
    duration_minutes: i32,
    order: i32,
    is_active: bool,
    version_id: Option<i32>,
    question_limit: i32,
    is_random_item: bool,
    is_random_choice: bool,
    total_questions: i32,
    active_questions: i32,
    max_score: f64,
    package_name: Option<String>,
    parent_package_id: Option<Uuid>,
    is_new: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

pub async fn admin_detail_section(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    latest_version_id: Option<i32>,
) -> Result<AdminSectionItem, AppError> {
    let is_new_sql = match latest_version_id {
        Some(vid) => format!("COALESCE(eps.version_id = {vid}, false)"),
        None => "false".to_string(),
    };

    let sql = format!(
        r#"
        SELECT
            eps.id,
            eps.package_id,
            eps.title,
            eps.group_name,
            eps.description,
            eps.duration_minutes,
            eps."order",
            eps.is_active,
            eps.version_id,
            eps.question_limit,
            eps.is_random_item,
            eps.is_random_choice,
            eps.total_questions,
            eps.active_questions,
            COALESCE(eps.max_score::float8, 0.0) AS max_score,
            ep.title AS package_name,
            ep.parent_package_id,
            {is_new_sql} AS is_new,
            eps.created_at,
            eps.updated_at
        FROM exam_package_sections eps
        LEFT JOIN exam_packages ep ON ep.id = eps.package_id
        WHERE eps.id = $1
        LIMIT 1
        "#
    );

    let r = AdminSectionDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        vec![Value::Uuid(Some(Box::new(id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackageSectionsDetailNotFound)))?;

    Ok(AdminSectionItem {
        id: r.id,
        package_id: r.package_id,
        title: r.title,
        group_name: r.group_name,
        description: r.description,
        duration_minutes: r.duration_minutes,
        order: r.order,
        is_active: r.is_active,
        version_id: r.version_id,
        question_limit: r.question_limit,
        is_random_item: r.is_random_item,
        is_random_choice: r.is_random_choice,
        total_questions: r.total_questions,
        active_questions: r.active_questions,
        max_score: r.max_score,
        package_name: r.package_name,
        parent_package_id: r.parent_package_id,
        is_new: r.is_new,
        created_at: r.created_at.to_rfc3339(),
        updated_at: r.updated_at.to_rfc3339(),
    })
}
