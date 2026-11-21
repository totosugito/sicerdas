use crate::app::AppState;
use crate::db::entities::exam::{exam_question_options, exam_question_solutions};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{
    ExamTagRef, QuestionDetailData, QuestionDetailOption, QuestionDetailPassage,
    QuestionDetailSolution,
};
use chrono::{DateTime, Utc};
use sea_orm::{ColumnTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, QueryOrder, Statement};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct QuestionDetailRow {
    id: Uuid,
    subject_id: Uuid,
    passage_id: Option<Uuid>,
    content: JsonValue,
    reason_content: Option<JsonValue>,
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
    passage_title: Option<String>,
    passage_content: Option<JsonValue>,
}

#[derive(Debug, FromQueryResult)]
struct TagRow {
    id: Uuid,
    name: String,
}

pub async fn detail_question(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<QuestionDetailData, AppError> {
    let q = QuestionDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            q.id,
            q.subject_id,
            q.passage_id,
            q.content,
            q.reason_content,
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
            p.title AS passage_title,
            p.content AS passage_content
        FROM exam_questions q
        LEFT JOIN exam_subjects s ON q.subject_id = s.id
        LEFT JOIN education_grades eg ON q.education_grade_id = eg.id
        LEFT JOIN exam_passages p ON q.passage_id = p.id
        WHERE q.id = $1
        LIMIT 1
        "#,
        vec![id.into()],
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| {
        AppError::NotFound(locales::translate(
            lang,
            LocaleKey::ExamQuestionsUpdateNotFound,
        ))
    })?;

    let options = exam_question_options::Entity::find()
        .filter(exam_question_options::Column::QuestionId.eq(id))
        .order_by_asc(exam_question_options::Column::Order)
        .all(&state.db)
        .await?
        .into_iter()
        .map(|o| QuestionDetailOption {
            id: o.id,
            content: o.content,
            is_correct: o.is_correct,
            score: o.score,
            order: o.order,
        })
        .collect();

    let solutions = exam_question_solutions::Entity::find()
        .filter(exam_question_solutions::Column::QuestionId.eq(id))
        .order_by_asc(exam_question_solutions::Column::Order)
        .all(&state.db)
        .await?
        .into_iter()
        .map(|s| QuestionDetailSolution {
            id: s.id,
            title: s.title,
            content: s.content,
            solution_type: s.solution_type.as_str().to_string(),
            order: s.order,
            required_tier: s.required_tier,
        })
        .collect();

    let tags = TagRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT et.id, et.name
        FROM exam_question_tags qt
        INNER JOIN education_tags et ON qt.tag_id = et.id
        WHERE qt.question_id = $1
        "#,
        vec![id.into()],
    ))
    .all(&state.db)
    .await?
    .into_iter()
    .map(|t| ExamTagRef {
        id: t.id,
        name: t.name,
    })
    .collect();

    let passage = q.passage_content.map(|content| QuestionDetailPassage {
        title: q.passage_title,
        content,
    });

    Ok(QuestionDetailData {
        id: q.id,
        subject_id: q.subject_id,
        passage_id: q.passage_id,
        content: q.content,
        difficulty: q.difficulty,
        r#type: q.r#type,
        max_score: q.max_score,
        scoring_strategy: q.scoring_strategy,
        required_tier: q.required_tier,
        education_grade_id: q.education_grade_id,
        is_active: q.is_active,
        variable_formulas: q.variable_formulas,
        created_at: q.created_at.to_rfc3339(),
        updated_at: q.updated_at.to_rfc3339(),
        subject_name: q.subject_name.unwrap_or_default(),
        education_grade_name: q.education_grade_name,
        reason_content: q.reason_content.unwrap_or_else(|| serde_json::json!([])),
        options,
        solutions,
        tags,
        passage,
    })
}
