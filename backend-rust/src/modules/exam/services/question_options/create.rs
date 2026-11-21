use crate::app::AppState;
use crate::db::entities::exam::{exam_question_options, exam_questions};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{CreateQuestionOptionBody, QuestionOptionItem};
use crate::modules::exam::utils::sync_question_max_score;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn create_question_option(
    state: &AppState,
    lang: Lang,
    body: CreateQuestionOptionBody,
) -> Result<QuestionOptionItem, AppError> {
    let q_exists = exam_questions::Entity::find_by_id(body.question_id)
        .one(&state.db)
        .await?
        .is_some();
    if !q_exists {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamQuestionOptionsCreateInvalidQuestion,
        )));
    }

    let content = body.content.unwrap_or_else(|| serde_json::json!([]));
    let active = exam_question_options::ActiveModel {
        id: Set(Uuid::new_v4()),
        question_id: Set(body.question_id),
        content: Set(content),
        is_correct: Set(body.is_correct.unwrap_or(false)),
        score: Set(body.score.unwrap_or(0)),
        order: Set(body.order.unwrap_or(0)),
    };

    let created = active.insert(&state.db).await?;
    sync_question_max_score(&state.db, body.question_id).await?;

    Ok(QuestionOptionItem {
        id: created.id,
        question_id: created.question_id,
        content: created.content,
        is_correct: created.is_correct,
        score: created.score,
        order: created.order,
    })
}
