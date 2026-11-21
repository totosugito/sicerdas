use crate::app::AppState;
use crate::db::entities::exam::{exam_question_solutions, exam_questions};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{CreateQuestionSolutionBody, QuestionSolutionItem};
use crate::modules::exam::utils::parse_solution_type;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn create_question_solution(
    state: &AppState,
    lang: Lang,
    body: CreateQuestionSolutionBody,
) -> Result<QuestionSolutionItem, AppError> {
    let q_exists = exam_questions::Entity::find_by_id(body.question_id)
        .one(&state.db)
        .await?
        .is_some();
    if !q_exists {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamQuestionSolutionsCreateInvalidQuestion,
        )));
    }

    let now = Utc::now();
    let content = body.content.unwrap_or_else(|| serde_json::json!([]));
    let active = exam_question_solutions::ActiveModel {
        id: Set(Uuid::new_v4()),
        question_id: Set(body.question_id),
        title: Set(body.title),
        content: Set(content),
        solution_type: Set(parse_solution_type(&body.solution_type)),
        order: Set(body.order.unwrap_or(0)),
        required_tier: Set(Some(body.required_tier.unwrap_or_else(|| "free".to_string()))),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let created = active.insert(&state.db).await?;
    Ok(QuestionSolutionItem {
        id: created.id,
        question_id: created.question_id,
        title: created.title,
        content: created.content,
        solution_type: created.solution_type.as_str().to_string(),
        order: created.order,
        required_tier: created.required_tier,
        created_at: created.created_at.to_rfc3339(),
        updated_at: created.updated_at.to_rfc3339(),
    })
}
