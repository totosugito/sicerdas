use crate::app::AppState;
use crate::db::entities::exam::exam_question_options;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{QuestionOptionItem, UpdateQuestionOptionBody};
use crate::modules::exam::utils::sync_question_max_score;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_question_option(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdateQuestionOptionBody,
) -> Result<QuestionOptionItem, AppError> {
    let existing = exam_question_options::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionOptionsUpdateNotFound,
            ))
        })?;

    let mut active: exam_question_options::ActiveModel = existing.into();
    if let Some(qid) = body.question_id {
        active.question_id = Set(qid);
    }
    if let Some(content) = body.content {
        active.content = Set(content);
    }
    if let Some(is_correct) = body.is_correct {
        active.is_correct = Set(is_correct);
    }
    if let Some(score) = body.score {
        active.score = Set(score);
    }
    if let Some(order) = body.order {
        active.order = Set(order);
    }

    let updated = active.update(&state.db).await?;
    sync_question_max_score(&state.db, updated.question_id).await?;

    Ok(QuestionOptionItem {
        id: updated.id,
        question_id: updated.question_id,
        content: updated.content,
        is_correct: updated.is_correct,
        score: updated.score,
        order: updated.order,
    })
}
