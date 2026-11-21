use crate::app::AppState;
use crate::db::entities::exam::exam_question_options;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::utils::sync_question_max_score;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_question_option(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<(), AppError> {
    let existing = exam_question_options::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionOptionsDeleteNotFound,
            ))
        })?;

    let question_id = existing.question_id;
    exam_question_options::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;
    sync_question_max_score(&state.db, question_id).await?;

    Ok(())
}
