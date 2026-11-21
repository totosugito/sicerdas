use crate::app::AppState;
use crate::db::entities::exam::exam_question_solutions;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{QuestionSolutionItem, UpdateQuestionSolutionBody};
use crate::modules::exam::utils::parse_solution_type;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_question_solution(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdateQuestionSolutionBody,
) -> Result<QuestionSolutionItem, AppError> {
    let existing = exam_question_solutions::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionSolutionsUpdateNotFound,
            ))
        })?;

    let mut active: exam_question_solutions::ActiveModel = existing.into();
    if let Some(qid) = body.question_id {
        active.question_id = Set(qid);
    }
    if let Some(title) = body.title {
        active.title = Set(title);
    }
    if let Some(content) = body.content {
        active.content = Set(content);
    }
    if let Some(st) = body.solution_type {
        active.solution_type = Set(parse_solution_type(&st));
    }
    if let Some(order) = body.order {
        active.order = Set(order);
    }
    if let Some(tier) = body.required_tier {
        active.required_tier = Set(Some(tier));
    }
    active.updated_at = Set(Utc::now().into());

    let updated = active.update(&state.db).await?;
    Ok(QuestionSolutionItem {
        id: updated.id,
        question_id: updated.question_id,
        title: updated.title,
        content: updated.content,
        solution_type: updated.solution_type.as_str().to_string(),
        order: updated.order,
        required_tier: updated.required_tier,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
    })
}
