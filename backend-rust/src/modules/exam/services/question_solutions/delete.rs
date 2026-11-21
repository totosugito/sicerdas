use crate::app::AppState;
use crate::db::entities::exam::exam_question_solutions;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_question_solution(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<(), AppError> {
    let existing = exam_question_solutions::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionSolutionsDeleteNotFound,
            ))
        })?;

    exam_question_solutions::Entity::delete_by_id(existing.id)
        .exec(&state.db)
        .await?;

    Ok(())
}
