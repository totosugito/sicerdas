use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    SessionDetailsData, SessionDetailsGrade, SessionDetailsPackage, SessionDetailsSection,
    SessionDetailsSession, SessionGridItem,
};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SessionMetaRow {
    id: Uuid,
    package_id: Uuid,
    status: String,
    mode: String,
    elapsed_seconds: i32,
    is_timer_active: bool,
    score: Option<f64>,
    earned_points: Option<f64>,
    max_points: Option<f64>,
    package_title: String,
    section_title: String,
    grade_name: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct GridAnswerRow {
    question_id: Uuid,
    question_order: i32,
    selected_option_id: Option<Uuid>,
    text_answer: Option<JsonValue>,
    is_doubtful: bool,
    is_correct: Option<bool>,
    question_content: Option<JsonValue>,
}

pub async fn details_session(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    session_id: Uuid,
) -> Result<SessionDetailsData, AppError> {
    let meta = SessionMetaRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            es.id,
            es.package_id,
            es.status::text AS status,
            es.mode::text AS mode,
            es.elapsed_seconds,
            es.is_timer_active,
            es.score::float8 AS score,
            es.earned_points::float8 AS earned_points,
            es.max_points::float8 AS max_points,
            ep.title AS package_title,
            eps.title AS section_title,
            eg.name AS grade_name
        FROM exam_sessions es
        INNER JOIN exam_packages ep ON ep.id = es.package_id
        INNER JOIN exam_package_sections eps ON eps.id = es.section_id
        LEFT JOIN education_grades eg ON eg.id = ep.education_grade_id
        WHERE es.id = $1 AND es.user_id = $2
        LIMIT 1
        "#,
        vec![
            Value::Uuid(Some(Box::new(session_id))),
            Value::Uuid(Some(Box::new(user_id))),
        ],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsErrorsNotFound)))?;

    let answers = GridAnswerRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            esa.question_id,
            esa.question_order,
            esa.selected_option_id,
            esa.text_answer,
            esa.is_doubtful,
            esa.is_correct,
            eq.content AS question_content
        FROM exam_session_answers esa
        INNER JOIN exam_questions eq ON eq.id = esa.question_id
        WHERE esa.session_id = $1
        ORDER BY esa.question_order ASC
        "#,
        vec![Value::Uuid(Some(Box::new(session_id)))],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let is_completed = meta.status == "completed";
    let is_study = meta.mode == "study";

    let grid = answers
        .into_iter()
        .map(|ans| {
            let is_answered = ans.selected_option_id.is_some() || ans.text_answer.is_some();
            let is_correct = if is_completed || (is_study && is_answered) {
                ans.is_correct
            } else {
                None
            };
            SessionGridItem {
                question_id: ans.question_id,
                order: ans.question_order,
                is_answered,
                is_doubtful: ans.is_doubtful,
                is_correct,
                question_content: ans.question_content,
            }
        })
        .collect();

    Ok(SessionDetailsData {
        session: SessionDetailsSession {
            id: meta.id,
            package_id: meta.package_id,
            status: meta.status,
            mode: meta.mode,
            elapsed_seconds: meta.elapsed_seconds,
            is_timer_active: meta.is_timer_active,
            score: meta.score,
            earned_points: meta.earned_points,
            max_points: meta.max_points,
        },
        package: SessionDetailsPackage {
            id: meta.package_id,
            title: meta.package_title,
            grade: SessionDetailsGrade {
                name: meta.grade_name,
            },
        },
        section: SessionDetailsSection {
            title: meta.section_title,
        },
        grid,
    })
}
