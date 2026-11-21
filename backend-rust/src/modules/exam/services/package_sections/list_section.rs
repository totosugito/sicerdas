use crate::app::AppState;
use crate::db::entities::exam::exam_packages;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{ListSectionBody, PublicSectionItem};
use sea_orm::{ColumnTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct PublicSectionRow {
    id: Uuid,
    title: String,
    group_name: Option<String>,
    description: Option<String>,
    duration_minutes: i32,
    total_questions: i32,
    active_questions: i32,
    order: i32,
    user_status: Option<String>,
    user_mode: Option<String>,
    best_tryout_score: Option<f64>,
}

pub async fn list_section(
    state: &AppState,
    lang: Lang,
    user_id: Option<Uuid>,
    body: ListSectionBody,
) -> Result<Vec<PublicSectionItem>, AppError> {
    let pkg = exam_packages::Entity::find_by_id(body.package_id)
        .filter(exam_packages::Column::IsActive.eq(true))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if pkg.is_none() {
        return Err(AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)));
    }

    let rows = if let Some(uid) = user_id {
        PublicSectionRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            WITH latest_sessions AS (
                SELECT DISTINCT ON (section_id)
                    section_id,
                    status::text AS user_status,
                    mode::text AS user_mode
                FROM exam_sessions
                WHERE user_id = $1
                ORDER BY section_id,
                    CASE WHEN status = 'in_progress' THEN 0 ELSE 1 END,
                    created_at DESC
            ),
            best_scores AS (
                SELECT
                    section_id,
                    MAX(score)::float8 AS best_tryout_score
                FROM exam_sessions
                WHERE user_id = $1 AND mode = 'tryout'
                GROUP BY section_id
            )
            SELECT
                eps.id,
                eps.title,
                eps.group_name,
                eps.description,
                eps.duration_minutes,
                eps.total_questions,
                eps.active_questions,
                eps."order",
                ls.user_status,
                ls.user_mode,
                bs.best_tryout_score
            FROM exam_package_sections eps
            LEFT JOIN latest_sessions ls ON ls.section_id = eps.id
            LEFT JOIN best_scores bs ON bs.section_id = eps.id
            WHERE eps.package_id = $2 AND eps.is_active = true
            ORDER BY eps."order" ASC
            "#,
            vec![
                Value::Uuid(Some(Box::new(uid))),
                Value::Uuid(Some(Box::new(body.package_id))),
            ],
        ))
        .all(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
    } else {
        PublicSectionRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            SELECT
                eps.id,
                eps.title,
                eps.group_name,
                eps.description,
                eps.duration_minutes,
                eps.total_questions,
                eps.active_questions,
                eps."order",
                NULL::text AS user_status,
                NULL::text AS user_mode,
                NULL::float8 AS best_tryout_score
            FROM exam_package_sections eps
            WHERE eps.package_id = $1 AND eps.is_active = true
            ORDER BY eps."order" ASC
            "#,
            vec![Value::Uuid(Some(Box::new(body.package_id)))],
        ))
        .all(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
    };

    Ok(rows
        .into_iter()
        .map(|r| PublicSectionItem {
            id: r.id,
            title: r.title,
            group_name: r.group_name,
            description: r.description,
            duration_minutes: r.duration_minutes,
            total_questions: r.total_questions,
            active_questions: r.active_questions,
            order: r.order,
            user_status: r.user_status,
            user_mode: r.user_mode,
            best_tryout_score: r.best_tryout_score,
        })
        .collect())
}
